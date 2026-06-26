import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

const getProjectMemberIds = (project) => {
  return project.members.map((member) => member.user.toString());
};

const normalizeLabels = (labels) => {
  if (!Array.isArray(labels)) {
    return null;
  }

  return [
    ...new Set(labels.map((label) => String(label).trim().toLowerCase()).filter(Boolean))
  ];
};

const parseDate = (value) => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isProjectMember = async (projectId, userId) => {
  return Project.findOne({
    _id: projectId,
    "members.user": userId
  });
};

const isProjectAdmin = (project, userId) => {
  const member = project.members.find((item) => item.user.toString() === userId.toString());
  return member && (member.role === "owner" || member.role === "admin");
};

const getAccessibleProjectIds = async (userId) => {
  const projects = await Project.find({
    "members.user": userId
  }).select("_id");

  return projects.map((project) => project._id);
};

export const createIssue = async (req, res, next) => {
  try {
    const { project, title, description, priority, assignee, dueDate, labels } = req.body;

    const projectDoc = await isProjectMember(project, req.user._id);

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied"
      });
    }

    if (assignee) {
      const memberIds = getProjectMemberIds(projectDoc);
      if (!memberIds.includes(assignee)) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of the project"
        });
      }
    }

    let parsedDueDate = null;

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      parsedDueDate = parseDate(dueDate);

      if (!parsedDueDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid dueDate"
        });
      }
    }

    let normalizedLabels;

    if (labels !== undefined) {
      normalizedLabels = normalizeLabels(labels);

      if (!normalizedLabels) {
        return res.status(400).json({
          success: false,
          message: "Labels must be an array of strings"
        });
      }
    }

    const issue = await Issue.create({
      project,
      title,
      description,
      priority,
      assignee: assignee || null,
      dueDate: parsedDueDate,
      createdBy: req.user._id,
      ...(normalizedLabels !== undefined && { labels: normalizedLabels }),
      statusHistory: [
        {
          to: "open",
          changedBy: req.user._id
        }
      ]
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: populatedIssue
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllIssues = async (req, res, next) => {
  try {
    const {
      project,
      status,
      priority,
      assignee,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    const accessibleProjectIds = await getAccessibleProjectIds(req.user._id);

    if (accessibleProjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        currentPage: 1,
        totalPages: 0,
        totalIssues: 0,
        count: 0,
        data: []
      });
    }

    const filter = {
      project: { $in: accessibleProjectIds }
    };

    if (project) {
      const hasAccess = accessibleProjectIds.some((id) => id.toString() === project);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied for this project"
        });
      }

      filter.project = project;
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignee) {
      filter.assignee = assignee;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const safeOrder = order === "asc" ? 1 : -1;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const issues = await Issue.find(filter)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ [sortBy]: safeOrder })
      .skip(skip)
      .limit(limitNumber);

    const totalIssues = await Issue.countDocuments(filter);
    const totalPages = Math.ceil(totalIssues / limitNumber);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages,
      totalIssues,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    return next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    const project = await isProjectMember(issue.project._id, req.user._id);

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this issue"
      });
    }

    return res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    return next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    const project = await Project.findOne({
      _id: issue.project,
      "members.user": req.user._id
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this issue"
      });
    }

    const { title, description, status, priority, assignee, dueDate, labels } = req.body;

    let hasChanges = false;

    if (title !== undefined) {
      issue.title = title;
      hasChanges = true;
    }

    if (description !== undefined) {
      issue.description = description;
      hasChanges = true;
    }

    if (priority !== undefined) {
      issue.priority = priority;
      hasChanges = true;
    }

    if (assignee !== undefined) {
      if (assignee === null || assignee === "") {
        issue.assignee = null;
        hasChanges = true;
      } else {
        const memberIds = getProjectMemberIds(project);

        if (!memberIds.includes(assignee)) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be a member of the project"
          });
        }

        issue.assignee = assignee;
        hasChanges = true;
      }
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        issue.dueDate = null;
      } else {
        const parsedDueDate = parseDate(dueDate);

        if (!parsedDueDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid dueDate"
          });
        }

        issue.dueDate = parsedDueDate;
      }

      hasChanges = true;
    }

    if (labels !== undefined) {
      const normalizedLabels = normalizeLabels(labels);

      if (!normalizedLabels) {
        return res.status(400).json({
          success: false,
          message: "Labels must be an array of strings"
        });
      }

      issue.labels = normalizedLabels;
      hasChanges = true;
    }

    if (status !== undefined && status !== issue.status) {
      issue.statusHistory.push({
        from: issue.status,
        to: status,
        changedBy: req.user._id
      });
      issue.status = status;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    const project = await Project.findOne({
      _id: issue.project,
      "members.user": req.user._id
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this issue"
      });
    }

    const canDelete =
      issue.createdBy.toString() === req.user._id.toString() ||
      isProjectAdmin(project, req.user._id);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Only the issue creator, project admin, or owner can delete the issue"
      });
    }

    await Comment.deleteMany({ issue: issue._id });
    await Issue.findByIdAndDelete(issue._id);

    return res.status(200).json({
      success: true,
      message: "Issue and related comments deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
};

import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

const isProjectAdmin = (project, userId) => {
  const member = project.members.find(
    (item) => item.user.toString() === userId.toString()
  );

  return member && (member.role === "owner" || member.role === "admin");
};


export const createComment = async (req, res, next) => {
  try {
    const { issue: issueId, content } = req.body;
    const issue = await Issue.findById(issueId);
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

    const comment = await Comment.create({
      issue: issueId,
      author: req.user._id,
      content
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};


export const getCommentsByIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);

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

    const comments = await Comment.find({ issue: issue._id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};


export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const issue = await Issue.findById(comment.issue);

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
      comment.author.toString() === req.user._id.toString() ||
      isProjectAdmin(project, req.user._id);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Only the comment author, project admin, or owner can delete the comment"
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
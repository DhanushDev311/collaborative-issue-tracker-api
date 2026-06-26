import { body, query } from "express-validator";

import { objectIdParam, paginationValidators } from "./commonValidators.js";

const validStatuses = ["open", "in-progress", "resolved", "closed"];
const validPriorities = ["low", "medium", "high", "urgent"];

const labelsValidator = body("labels")
  .optional()
  .isArray()
  .withMessage("Labels must be an array of strings");

export const createIssueValidation = [
  body("project")
    .notEmpty()
    .withMessage("Project is required")
    .isMongoId()
    .withMessage("Project must be a valid MongoDB ObjectId"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Issue title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Description cannot exceed 3000 characters"),
  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage("Priority must be one of low, medium, high, or urgent"),
  body("assignee")
    .optional({ nullable: true, values: "falsy" })
    .isMongoId()
    .withMessage("Assignee must be a valid MongoDB ObjectId"),
  body("dueDate")
    .optional({ nullable: true, values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date"),
  labelsValidator
];

export const updateIssueValidation = [
  objectIdParam(),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Issue title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Description cannot exceed 3000 characters"),
  body("status")
    .optional()
    .isIn(validStatuses)
    .withMessage("Status must be one of open, in-progress, resolved, or closed"),
  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage("Priority must be one of low, medium, high, or urgent"),
  body("assignee")
    .optional({ nullable: true, values: "falsy" })
    .isMongoId()
    .withMessage("Assignee must be a valid MongoDB ObjectId"),
  body("dueDate")
    .optional({ nullable: true, values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date"),
  labelsValidator
];

export const issueListValidation = [
  ...paginationValidators,
  query("project")
    .optional()
    .isMongoId()
    .withMessage("project must be a valid MongoDB ObjectId"),
  query("status")
    .optional()
    .isIn(validStatuses)
    .withMessage("status must be one of open, in-progress, resolved, or closed"),
  query("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage("priority must be one of low, medium, high, or urgent"),
  query("assignee")
    .optional()
    .isMongoId()
    .withMessage("assignee must be a valid MongoDB ObjectId"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "dueDate", "status"])
    .withMessage("sortBy must be one of createdAt, updatedAt, dueDate, or status"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("search cannot exceed 200 characters")
];

export const issueIdValidation = [objectIdParam()];

import { body } from "express-validator";

import { objectIdParam } from "./commonValidators.js";

export const createCommentValidation = [
  body("issue")
    .notEmpty()
    .withMessage("Issue is required")
    .isMongoId()
    .withMessage("Issue must be a valid MongoDB ObjectId"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters")
];

export const commentIdValidation = [objectIdParam()];
export const issueCommentsValidation = [objectIdParam("issueId")];

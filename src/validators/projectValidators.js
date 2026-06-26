import { body } from "express-validator";

import { objectIdParam } from "./commonValidators.js";

export const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 120 })
    .withMessage("Project name cannot exceed 120 characters"),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
];

export const updateProjectValidation = [
  objectIdParam(),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty")
    .isLength({ max: 120 })
    .withMessage("Project name cannot exceed 120 characters"),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
];

export const projectMemberValidation = [
  objectIdParam(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),
  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member")
];

export const updateMemberRoleValidation = [
  objectIdParam(),
  objectIdParam("memberId"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member")
];

export const projectIdValidation = [objectIdParam()];
export const projectMemberIdValidation = [objectIdParam(), objectIdParam("memberId")];

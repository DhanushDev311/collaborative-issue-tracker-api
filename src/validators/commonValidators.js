import { param, query } from "express-validator";

export const objectIdParam = (field = "id") =>
  param(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId`);

export const paginationValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be either asc or desc")
];

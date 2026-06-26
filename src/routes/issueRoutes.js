import express from "express";

import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssue
} from "../controllers/issueController.js";
import { protect } from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  createIssueValidation,
  issueIdValidation,
  issueListValidation,
  updateIssueValidation
} from "../validators/issueValidators.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createIssueValidation, validateRequest, createIssue)
  .get(issueListValidation, validateRequest, getAllIssues);

router
  .route("/:id")
  .get(issueIdValidation, validateRequest, getIssueById)
  .patch(updateIssueValidation, validateRequest, updateIssue)
  .delete(issueIdValidation, validateRequest, deleteIssue);

export default router;

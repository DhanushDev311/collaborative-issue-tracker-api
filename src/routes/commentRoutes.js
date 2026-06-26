import express from "express";

import {
  createComment,
  deleteComment,
  getCommentsByIssue
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  commentIdValidation,
  createCommentValidation,
  issueCommentsValidation
} from "../validators/commentValidators.js";

const router = express.Router();

router.use(protect);

router.post("/", createCommentValidation, validateRequest, createComment);
router.get("/issue/:issueId", issueCommentsValidation, validateRequest, getCommentsByIssue);
router.delete("/:id", commentIdValidation, validateRequest, deleteComment);

export default router;

import express from "express";

import {
  addProjectMember,
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  createProjectValidation,
  projectIdValidation,
  projectMemberIdValidation,
  projectMemberValidation,
  updateMemberRoleValidation,
  updateProjectValidation
} from "../validators/projectValidators.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createProjectValidation, validateRequest, createProject)
  .get(getAllProjects);

router
  .route("/:id")
  .get(projectIdValidation, validateRequest, getProjectById)
  .patch(updateProjectValidation, validateRequest, updateProject)
  .delete(projectIdValidation, validateRequest, deleteProject);

router.post("/:id/members", projectMemberValidation, validateRequest, addProjectMember);
router.patch(
  "/:id/members/:memberId/role",
  updateMemberRoleValidation,
  validateRequest,
  updateProjectMemberRole
);
router.delete(
  "/:id/members/:memberId",
  projectMemberIdValidation,
  validateRequest,
  removeProjectMember
);

export default router;

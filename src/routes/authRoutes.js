import express from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { loginValidation, registerValidation } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", registerValidation, validateRequest, registerUser);
router.post("/login", loginValidation, validateRequest, loginUser);
router.get("/me", protect, getCurrentUser);

export default router;

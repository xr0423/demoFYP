import {
  register,
  login,
  logout,
  sendVerificationCode,
} from "../controllers/auth.js";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

// New routes
router.post("/send-code", sendVerificationCode); // Route for sending the email verification code

export default router;

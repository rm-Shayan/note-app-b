import express from "express";
import { 
    registerUser, 
    verifyEmail, 
    loginUser, 
    forgotPassword, 
    verifyOtp,
    resetPassword,
    logoutUser,
    changeCurrentPassword
} from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";
import { 
    userRegistrationSchema, 
    verifyEmailSchema, 
    userLoginSchema, 
    resetPasswordSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    verifyOtpSchema
} from "../validators/user.validator.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { JWT_SERVICE_SECRET } from "../constants.js";

const router = express.Router();

// --- 1. Public Routes (No Token Needed) ---

// Signup & Email Verification
router.post("/register", validate(userRegistrationSchema), registerUser);
router.get(
  "/verify-email/:email", 
  authMiddleware(JWT_SERVICE_SECRET), 
  validate(verifyEmailSchema), 
  verifyEmail
);


router.post("/login", validate(userLoginSchema), loginUser);


router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword); // Body mein email jayegi
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);



router.use(authMiddleware()); 

router.post("/logout", logoutUser);
router.post("/change-password", validate(changePasswordSchema), changeCurrentPassword);

export default router;
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendMail } from "../services/email.service.js";
import { generateEmailTemplate } from "../utils/generate-email-templates.js";
import jwt from "jsonwebtoken";
import { JWT_SERVICE_SECRET, JWT_SERVICE_EXPIRY } from "../constants.js";
import otpGenerator from "otp-generator"; // Package import kiya
import {Session} from "../models/session.model.js"


export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const verificationToken = jwt.sign({ email }, JWT_SERVICE_SECRET, {
    expiresIn: JWT_SERVICE_EXPIRY,
  });

 const user = await User.create({
    userName,
    email,
    password,
    token: verificationToken, 
    isVerified: false,
});

  const createdUser = await User.findById(user._id).select("-password -token");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const emailHTML = generateEmailTemplate("signup", {
    userName: createdUser.userName,
    token: verificationToken,
    email,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    expiry: JWT_SERVICE_EXPIRY,
  });

  sendMail({
    to: createdUser.email,
    subject: "Verify Your Account - Finetech",
    message: emailHTML,
  }).catch((error) => {
    console.error("Background Email Error:", error);
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "Registration successful! Verification email sent.",
      ),
    );
});


export const verifyEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;
    
 
    const token = req.token; 

    const user = await User.findOne({ email, token });

    if (!user) {
        throw new ApiError(404, "Invalid or expired verification link");
    }

    user.isVerified = true;
    user.token = undefined; 
    
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Account verified successfully! Welcome to Note-App.")
    );
});


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. User find karein
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    // 2. Verification check
    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    // --- MAIN GOAL: Purane Sessions Delete Karna ---
    // User ID ke against jitne bhi sessions hain pehle unhe khatam karo
    await Session.deleteMany({ userId: user._id });

    // 3. Tokens generate karein
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4. Naya Session create karein
    await Session.create({ 
        userId: user._id, 
        token: refreshToken 
    });

    // 5. User status update karein
    user.isLoggedIn = true;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = user.getSanitizedUser();

    const options = { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production" 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { user: loggedInUser, accessToken, refreshToken }, 
                "Logged in successfully and old sessions cleared"
            )
        );
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body; // Params se hata kar Body mein kar diya

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        specialChars: false, 
        lowerCaseAlphabets: false 
    });

    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    const emailHTML = generateEmailTemplate("otp", {
        userName: user.userName,
        otp: otp
    });

    sendMail({
        to: user.email,
        subject: "Password Reset OTP - Note-App",
        message: emailHTML
    }).catch(err => console.error("Forgot Pass Email Error:", err));

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent to your email successfully")
    );
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Note: Hum OTP delete nahi kar rahe abhi, Reset Password mein karenge
    return res.status(200).json(
        new ApiResponse(200, { email, otp }, "OTP verified successfully. Now you can reset your password.")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Security check: OTP dubara check karna zaroori hai
    const user = await User.findOne({ email, otp });

    if (!user) {
        throw new ApiError(400, "Session expired or invalid details. Please request a new OTP.");
    }

    user.password = newPassword;
    user.otp = undefined; // Ab use ho gaya, toh delete kar do
    
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully! Login with your new password.")
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.isLoggedIn = false;
        await user.save({ validateBeforeSave: false });
    }
    
    // Clear Session from DB
    await Session.deleteOne({ userId: req.user._id });

    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(200, {}, "Logged out"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(oldPassword))) throw new ApiError(400, "Wrong old password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed"));
});
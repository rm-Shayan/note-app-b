import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
    JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY, 
    JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY
} from '../constants.js';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    token: {
        type: String
    }
}, { timestamps: true });

// --- 1. Middleware: Password Hashing (Save hone se pehle) ---
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return ;
    
    this.password = await bcrypt.hash(this.password, 10);
    return
});

// --- 2. Method: Password Compare ---
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// --- 3. Method: Generate Access Token ---
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRY }
    );
};

// --- 4. Method: Generate Refresh Token ---
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRY }
    );
};

userSchema.methods.getSanitizedUser = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.token;
    delete userObject.otp;
    delete userObject.updatedAt; // Optional: agar zaroorat nahi
    return userObject;
};

export const User = mongoose.model("User", userSchema);
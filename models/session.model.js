import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Ye aapke User model ka naam hai
        required: [true, "Session must belong to a user"]
    }
}, { timestamps: true });

// Indexing for performance (Expiring sessions automatically)

export const Session = mongoose.model("Session", sessionSchema);
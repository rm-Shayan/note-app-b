import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan'; // Logging ke liye
import compression from 'compression'; // Performance ke liye
import helmet from 'helmet'; // Security header middleware
import { errorHandler } from './middlewares/eroorHandle.middleware.js';
import authRoute from "./routes/auth.route.js"

export const app=express();
// --- 1. Global Middlewares ---
app.use(helmet());
// Request Logging (Development mode mein 'dev' best hai)
app.use(morgan('dev')); 

// Gzip Compression (Responses ka size chota karne ke liye)
app.use(compression());
// Cross-Origin Resource Sharing (Frontend connectivity ke liye)
app.use(cors());
// Body parsers (JSON aur URL encoded data handle karne ke liye)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookies read karne ke liye (JWT Refresh tokens aksar cookies mein hote hain)
app.use(cookieParser());


// --- Basic Route ---

app.use("/api/v1/auth",authRoute)


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is up and running!"
    });
});

// ------- Error Handle Middleware ------
app.use(errorHandler)



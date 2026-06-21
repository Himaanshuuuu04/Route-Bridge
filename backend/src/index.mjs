import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import surveyRoutes from "./routes/survey.routes.mjs";
import dashboardRouter from "./routes/dashboard.routes.mjs"
import userRouter from "./routes/user.routes.mjs"
import authMiddleware from "./middleware/auth.middleware.mjs";
import connectDB from "./config/db.mjs"

dotenv.config();
dotenv.config({ path: "../.env" });
const app = express();

// Trust reverse proxy (Caddy) for secure cookies and headers
app.set("trust proxy", 1);

const allowedOrigins = [
    "https://dashboard.evoglobalinsight.com",
    "https://portal.evoglobalinsight.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001"
];

if (process.env.FRONTEND_URL) {
    const sanitizedUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    allowedOrigins.push(sanitizedUrl);
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); 
connectDB();

// routes
app.use("/health", (req, res) => {
    res.send("OK");
});
app.use("/l", surveyRoutes);//webhook for typeform survey 
app.use("/api/user",userRouter);
app.use("/api/dashboard",dashboardRouter,authMiddleware);

// error handling
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        status,
        message
    });
});

// 404 handler
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});


app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        status,
        message
    });
});


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
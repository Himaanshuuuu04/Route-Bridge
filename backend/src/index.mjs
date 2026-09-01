import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Configuration & DB
import connectDB from "./config/db.mjs";
import { corsOptions } from "./config/cors.mjs";
import "./config/redis.mjs";
import "./config/bullmq.mjs"; // Initializes background workers

// Middlewares
import authMiddleware from "./middleware/auth.middleware.mjs";
import adminMiddleware from "./middleware/admin.middleware.mjs";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.mjs";

// Routes
import trafficRoutes from "./routes/traffic.routes.mjs";
import screenerRoutes from "./routes/screener.routes.mjs";
import surveyRoutes from "./routes/survey.routes.mjs";
import userRouter from "./routes/user.routes.mjs";
import dashboardRouter from "./routes/dashboard.routes.mjs";
import surveyAdminRoutes from "./routes/surveyAdmin.routes.mjs";
import mockRoutes from "./routes/mock.routes.mjs";

// Environment setup
dotenv.config();
dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (Caddy) for secure cookies and headers
app.set("trust proxy", 1);

// Core Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../public")));

// Initialize Database Connection
connectDB().then(() => {
  console.log("MongoDB Connected");
});

// Health check route
app.get("/health", (req, res) => {
  res.send("OK");
});

// Application Routes
app.use("/r", trafficRoutes); // Module 2A: Entry & Traffic routing
app.use("/api/screener", screenerRoutes); // Module 2B: Screener questionnaire
app.use("/l", surveyRoutes); // Module 2D: Legacy bridge
app.use("/i", surveyRoutes); // Module 2D: Legacy bridge alias
app.use("/api/user", userRouter);
app.use("/api/dashboard", dashboardRouter, authMiddleware);
app.use("/api/admin/surveys", authMiddleware, adminMiddleware, surveyAdminRoutes);

// Mock Routes for Testing
app.use("/", mockRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
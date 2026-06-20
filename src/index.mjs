import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";


dotenv.config();
const app = express();

const allowedOrigins = [
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

// routes
app.use("/health", (req, res) => {
    res.send("OK");
});


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
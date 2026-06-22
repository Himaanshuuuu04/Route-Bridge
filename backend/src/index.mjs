import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import surveyRoutes from "./routes/survey.routes.mjs";
import dashboardRouter from "./routes/dashboard.routes.mjs"
import userRouter from "./routes/user.routes.mjs"
import authMiddleware from "./middleware/auth.middleware.mjs";
import connectDB from "./config/db.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static(path.join(__dirname, "../public")));
import { initAgenda } from "./config/agenda.mjs";
import mongoose from "mongoose";

connectDB().then(() => {
    initAgenda(mongoose.connection);
});
import trafficRoutes from "./routes/traffic.routes.mjs";
import screenerRoutes from "./routes/screener.routes.mjs";
import surveyAdminRoutes from "./routes/surveyAdmin.routes.mjs";

// routes
app.use("/health", (req, res) => {
    res.send("OK");
});
app.use("/r", trafficRoutes); // Module 2A
app.use("/api/screener", screenerRoutes); // Module 2B
app.use("/l", surveyRoutes); // Module 2D Legacy Bridge
app.use("/api/user", userRouter);
app.use("/api/dashboard", dashboardRouter, authMiddleware);
app.use("/api/admin/surveys", authMiddleware, surveyAdminRoutes);

// =========================================================================
// MOCK ROUTES FOR END-TO-END TESTING
// =========================================================================
app.get('/mock-supplier', (req, res) => {
    const { uid, pid } = req.query;
    res.send(`
        <html>
            <head>
                <title>Mock Supplier Survey</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; box-sizing: border-box; }
                    .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 10px 30px -15px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; border: 1px solid #e2e8f0; }
                    h1 { font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 8px; font-weight: 700; }
                    p { margin: 12px 0; color: #475569; font-size: 15px; line-height: 1.5; }
                    .info { background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 16px 0; border: 1px solid #e2e8f0; overflow-x: auto; }
                    .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
                    .btn { padding: 12px; border-radius: 8px; text-decoration: none; color: white; font-weight: 600; font-size: 14px; text-align: center; transition: background 0.2s; border: none; cursor: pointer; }
                    .btn-complete { background: #10b981; }
                    .btn-complete:hover { background: #059669; }
                    .btn-terminate { background: #ef4444; }
                    .btn-terminate:hover { background: #dc2626; }
                    .btn-quota { background: #f59e0b; }
                    .btn-quota:hover { background: #d97706; }
                    .btn-security { background: #6366f1; }
                    .btn-security:hover { background: #4f46e5; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Mock Supplier Survey</h1>
                    <p>You have successfully matched the screener rules and redirected to the supplier survey page!</p>
                    <div class="info">
                        <strong>Transaction ID (uid):</strong> ${uid}<br/>
                        <strong>Project ID (pid):</strong> ${pid}
                    </div>
                    <p>Select a survey outcome below to simulate the supplier redirecting the respondent back to the backend legacy bridge:</p>
                    <div class="btn-group">
                        <a href="/l/complete?uid=${uid}&pid=${pid}" class="btn btn-complete">Complete (100% OK)</a>
                        <a href="/l/terminate?uid=${uid}&pid=${pid}" class="btn btn-terminate">Screen Out (Terminate)</a>
                        <a href="/l/quotafull?uid=${uid}&pid=${pid}" class="btn btn-quota">Quota Full</a>
                        <a href="/l/securityterm?uid=${uid}&pid=${pid}" class="btn btn-security">Security Term</a>
                    </div>
                </div>
            </body>
        </html>
    `);
});

const handleMockVendorCallback = (statusStr) => (req, res) => {
    // Check multiple query variations (rid, vendor_rid, uid) for flexibility
    const identifier = req.query.vendor_rid || req.query.rid || req.query.uid || 'Unknown';
    console.log('\x1b[36m%s\x1b[0m', `[Mock Vendor Callback] Webhook trigger successfully received!`);
    console.log(`  └─ Vendor RID: ${identifier}`);
    console.log(`  └─ Simulated Status Endpoint: ${statusStr}`);
    console.log(`  └─ Timestamp: ${new Date().toISOString()}\n`);
    res.status(200).send(`Mock Vendor received ${statusStr} postback OK!`);
};

app.get('/mock-vendor-callback/complete', handleMockVendorCallback('Complete'));
app.get('/mock-vendor-callback/terminate', handleMockVendorCallback('Terminate'));
app.get('/mock-vendor-callback/quotafull', handleMockVendorCallback('Quota Full'));
app.get('/mock-vendor-callback/securityterm', handleMockVendorCallback('Security Term'));

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
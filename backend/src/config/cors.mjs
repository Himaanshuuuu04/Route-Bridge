export const allowedOrigins = [
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

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

export default corsOptions;

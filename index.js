import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes/index.js";
import dotenv from "dotenv";
import seedAdmin from "./utils/seedAdmin.js";

dotenv.config();

connectDB();
seedAdmin();

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "https://qridey.vercel.app",
  "http://localhost:5173",
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ✅ Explicitly handle OPTIONS preflight
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("hi");
});

// ✅ API routes
app.use("/api", apiRouter);

// ✅ Global error handler to include CORS headers even on errors
app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

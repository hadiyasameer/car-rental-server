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

const allowedOrigins = [
  "https://qridey.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
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

// ✅ Handle preflight requests explicitly
app.options("*", cors());

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hi");
});

app.use("/api", apiRouter);

// ✅ Ensure CORS headers on errors too
app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

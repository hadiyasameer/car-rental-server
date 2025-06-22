import express from "express"
import { connectDB } from "./config/db.js"
import cors from "cors"
const app = express()
import cookieParser from 'cookie-parser'
import { apiRouter } from "./routes/index.js"
import dotenv from "dotenv";
import seedAdmin from "./utils/seedAdmin.js"

dotenv.config();

connectDB();

seedAdmin();


const allowedOrigins = [
    'https://ride-qatar.vercel.app',
    'http://localhost:5173'
]
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    preflightContinue: false,
    optionsSuccessStatus: 204
})
)
app.use(express.json())

app.use(cookieParser());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("hi")
})

app.use("/api", apiRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


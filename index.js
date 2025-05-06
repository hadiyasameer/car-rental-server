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

const prodOrigins = [process.env.ORIGIN_1, process.env.ORIGIN_2].filter(Boolean)
const devOrigin = ['http://localhost:5173']
const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigin
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                console.log(origin, allowedOrigins)
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        credentials: true
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


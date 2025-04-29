import express from "express"
import { connectDB } from "./config/db.js"
import cors from "cors"
const app=express()
import cookieParser from'cookie-parser'
import { apiRouter } from "./routes/index.js"
import dotenv from "dotenv";
import seedAdmin from "./utils/seedAdmin.js"

dotenv.config();

connectDB();

seedAdmin();

app.use(express.json())

app.use(
    cors({
        origin:'http://localhost:5173',
        methods:["GET","PUT","POST","DELETE","OPTIONS"],
        credentials:true
    })
)

app.use(cookieParser());

const port=process.env.port||3000;

app.get("/",(req,res)=>{
    res.send("hi")
})

app.use("/api",apiRouter)

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})


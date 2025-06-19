import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const userAuth = async(req, res, next) => {
    try {
        const { user_token } = req.cookies;
        if (!user_token) {
            return res.status(401).json({ message: "user not autherised", success: false })
        }

        const tokenVerified = jwt.verify(user_token, process.env.JWT_SECRET_KEY)
        if (!tokenVerified) {
            return res.status(401).json({ message: "user not autherised", success: false })
        }

        const user = await User.findById(tokenVerified.id).select("name email mobileNumber role");
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Error:", error);
        return res.status(401).json({ message: error.message || "user autherization failed", success: false })
    }
}
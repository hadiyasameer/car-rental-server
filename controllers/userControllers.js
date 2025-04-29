import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const userSignup = async (req, res, next) => {
    try {
        console.log("hitted");
        const { name, email, password, confirmPassword, mobileNumber, address, profilePicture } = req.body;
        if (!name || !email || !password || !confirmPassword || !mobileNumber) {
            return res.status(400).json({ message: "all fields are required" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "user already exist" })
        }

        const hashedPassword = bcrypt.hashSync(password, 10)

        const userData = new User({ name, email, password: hashedPassword, mobileNumber, address, profilePicture })
        await userData.save();

        const user_token = generateToken(userData._id)
        res.cookie("user_token", user_token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
        })
        return res.status(201).json({ data: userData, message: "user account created" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" })
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "user does not exist" })
        }
        const passwordMatch = bcrypt.compareSync(password, userExist.password)
        if (!passwordMatch) {
            return res.status(401).json({ message: "user not authenticated" })
        }
        const user_token = generateToken(userExist._id)
        res.cookie("user_token", user_token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
        })
        {
            const { password, ...userDataWithoutPassword } = userExist._doc;
            return res.json({ data: userDataWithoutPassword, message: "user login success" })
        }
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("user_token", {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
        })
        return res.json({ message: "user logout successful" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}

export const userProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userData = await User.findById(userId).select("-password")
        return res.json({ data: userData, message: "user profile fetched" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }

}

export const checkUser=async(req,res,next)=>{
    try {
        return res.json({message:"user authorised"})
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
        
    }
}
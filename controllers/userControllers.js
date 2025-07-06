import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 3 * 24 * 60 * 60 * 1000,
};

export const userSignup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, mobileNumber, address, profilePicture } = req.body;

        if (!name || !email || !password || !confirmPassword || !mobileNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({ name, email, password: hashedPassword, mobileNumber, address, profilePicture });
        await newUser.save();

        const user_token = generateToken({ id: newUser._id, role: "user" });

        res.cookie("user_token", user_token, cookieOptions);

        return res.status(201).json({ data: newUser, message: "User account created" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const passwordMatch = bcrypt.compareSync(password, userExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user_token = generateToken({ id: userExist._id, role: "user" });

        res.cookie("user_token", user_token, cookieOptions);

        const { password: pwd, ...userDataWithoutPassword } = userExist._doc;
        return res.json({ data: userDataWithoutPassword, message: "User login success" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("user_token", cookieOptions);

        return res.json({ message: "User logout successful" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const userData = await User.findById(userId).select("-password");
        return res.json({ data: userData, message: "User profile fetched" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const checkUser = async (req, res, next) => {
    try {
        return res.json({ message: "User authorised" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

import { Dealer } from "../models/dealerModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";


export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const admin = await Dealer.findOne({ email, role: 'admin' });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isPasswordValid = bcrypt.compareSync(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin_token = generateToken(admin._id, "admin");

        res.cookie("admin_token", admin_token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
        });

        const { password: _, ...adminData } = admin._doc;
        return res.status(200).json({ data: adminData, message: "Admin login successful" });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const adminLogout = async (req, res, next) => {
    try {
        res.clearCookie("admin_token", {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
        })
        return res.json({ message: "admin logout successful" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}
export const getAllDealers = async (req, res) => {
    try {
        const dealers = await Dealer.find({}, '_id name'); 
        res.status(200).json(dealers);
    } catch (error) {
        console.error('Error fetching dealers:', error);
        res.status(500).json({ message: 'Failed to fetch dealers' });
    }
};
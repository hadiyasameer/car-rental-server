import { Dealer } from "../models/dealerModel.js";
import { User } from "../models/userModel.js"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { Booking } from "../models/bookingModel.js";
import {Car} from "../models/carModel.js"

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
            maxAge: 3 * 24 * 60 * 60 * 1000 
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
            httpOnly: process.env.NODE_ENV === "production"
        })
        return res.json({ message: "admin logout successful" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}
export const getAllDealers = async (req, res) => {
    try {
        const dealers = await Dealer.find({ role: 'dealer' }, '_id name mobileNumber email profilePicture');
        console.log("Dealers fetched:", dealers);
        res.status(200).json(dealers);
    } catch (error) {
        console.error('Error fetching dealers:', error);
        res.status(500).json({ message: 'Failed to fetch dealers' });
    }
};

export const getAllUsers = async (req, res) => {
    console.log("✅ getAllUsers endpoint hit");
    try {
        const users = await User.find({}, '_id name mobileNumber email profilePicture');
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteDealer = async (req, res) => {
    try {
        const { id } = req.params;
        await Car.deleteMany({ dealer: id });
        const deletedDealer = await Dealer.findByIdAndDelete(id);
        if (!deletedDealer) {
            return res.status(404).json({ message: "Dealer not found" });
        }
        res.status(200).json({ message: "Dealer deleted successfully" });
    } catch (error) {
        console.error("Error deleting dealer:", error);
        res.status(500).json({ message: "Failed to delete dealer" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.deleteMany({ user: id });
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

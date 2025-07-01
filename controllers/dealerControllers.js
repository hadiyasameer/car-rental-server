import { Dealer } from "../models/dealerModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { Notification } from "../models/notificationModel.js";
import { Types } from "mongoose";

export const dealerSignup = async (req, res, next) => {
    try {
        console.log("hitted");
        const { name, email, password, confirmPassword, mobileNumber, profilePicture } = req.body;
        if (!name || !email || !password || !confirmPassword || !mobileNumber) {
            return res.status(400).json({ message: "all fields are required" })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const isDealerExist = await Dealer.findOne({ email });
        if (isDealerExist) {
            return res.status(400).json({ message: "dealer already exist" })
        }

        const hashedPassword = bcrypt.hashSync(password, 10)

        const newDealer = new Dealer({ name, email, password: hashedPassword, mobileNumber, profilePicture })
        await newDealer.save();

        const tokenPayload = (newDealer._id, "dealer");
        const dealer_token = generateToken(tokenPayload);

        res.cookie("dealer_token", dealer_token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: process.env.NODE_ENV === "production"
        })
        return res.status(201).json({ data: newDealer, message: "dealer account created" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const dealerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" })
        }

        const isDealerExist = await Dealer.findOne({ email });
        if (!isDealerExist) {
            return res.status(404).json({ message: "dealer does not exist" })
        }
        const passwordMatch = bcrypt.compareSync(password, isDealerExist.password)
        if (!passwordMatch) {
            return res.status(401).json({ message: "dealer not authenticated" })
        }


        const dealer_token = generateToken(isDealerExist._id, "dealer");


        res.cookie("dealer_token", dealer_token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 3 * 24 * 60 * 60 * 1000
        })
        {
            const { password, ...userDataWithoutPassword } = isDealerExist._doc;
            return res.json({ data: userDataWithoutPassword, message: "dealer login success" })
        }
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const dealerLogout = async (req, res, next) => {
    try {
        res.clearCookie("dealer_token", {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: process.env.NODE_ENV === "production"
        })
        return res.json({ message: "dealer logout successful" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}

export const dealerProfile = async (req, res, next) => {
    try {

        const dealerId = req.user.id;
        const dealerData = await Dealer.findById(dealerId).select("-password")
        return res.json({ data: dealerData, message: "dealer profile fetched" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }

}

export const checkDealer = async (req, res, next) => {
    try {
        return res.json({ message: "dealer authorised" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}

export const notificationList = async (req, res) => {
    try {
        const dealerId = req.user?._id || req.user?.id;

        if (!dealerId) {
            return res.status(401).json({ message: "Unauthorized: Dealer ID not found" });
        }

        const dealerObjectId = new Types.ObjectId(dealerId);

        const notifications = await Notification.find({ dealerId: dealerObjectId }).sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({ dealerId: dealerObjectId, isRead: false });

        console.log("Notifications found:", notifications);
        res.status(200).json({ notifications, unreadCount });
    } catch (err) {
        console.error("Error in notificationList:", err.message);
        res.status(500).json({ message: "Failed to load notifications", error: err.message });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            dealerId: req.user._id,
            isRead: false,
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch unread count" });
    }
};
export const markNotificationAsRead = async (req, res) => {
    try {
        console.log("Mark notification hit:", req.params.id, req.user?._id);

        const { id } = req.params;

        const updated = await Notification.findOneAndUpdate(
            { _id: id, dealer: req.user._id }, // 🔄 fix here
            { isRead: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ message: "Marked as read", notification: updated });
    } catch (err) {
        console.error("Error in markNotificationAsRead:", err);
        res.status(500).json({ error: "Failed to update notification" });
    }
};



import { Dealer } from "../models/dealerModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

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

        const token = generateToken(newDealer._id, "dealer")
        res.cookie("token", token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
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

        const tokenPayload = { id: isDealerExist._id, role: isDealerExist.role };
        const token = generateToken(tokenPayload);
         res.cookie("token", token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
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
        res.clearCookie("token", {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httponly: process.env.NODE_ENV === "production"
        })
        return res.json({ message: "dealer logout successful" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })

    }
}

export const dealerProfile = async (req, res, next) => {
    try {

        const dealerId = req.user.id;
        const dealerData = await Dealer.findById(dealerId.id).select("-password")
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
import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
    try {
        const { user_token } = req.cookies;
        if (!user_token) {
            return res.status(401).json({ message: "user not autherised", success: false })
        }

        const tokenVerified = jwt.verify(user_token, process.env.JWT_SECRET_KEY)
        if (!tokenVerified) {
            return res.status(401).json({ message: "user not autherised", success: false })
        }

        req.user = tokenVerified;

        next();

    } catch (error) {
        console.log("Error:", error);
        return res.status(401).json({ message: error.message || "user autherization failed", success: false })
    }
}
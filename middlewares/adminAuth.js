import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
    try {
        const { admin_token } = req.cookies;
        if (!admin_token) {
            return res.status(401).json({ message: "admin not autherised", success: false })
        }

        const tokenVerified = jwt.verify(admin_token, process.env.JWT_SECRET_KEY)
        if (!tokenVerified || tokenVerified.role !== 'admin') {
            return res.status(403).json({ message: "Access forbidden", success: false })
        }

        req.user = tokenVerified;
        
        next();

    } catch (error) {
        return res.status(401).json({ message: error.message || "admin autherization failed", success: false })
    }
}

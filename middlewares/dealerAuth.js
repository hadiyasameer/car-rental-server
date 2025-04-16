import jwt from "jsonwebtoken";

export const dealerAuth = (requiredRole = 'dealer') => {
    return (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: "dealer not autherised", success: false })
            }
        
                const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY)
        
            if (!tokenVerified || tokenVerified.id.role !== requiredRole) {
                return res.status(403).json({ message: "Access forbidden", success: false })
            }

            req.user = tokenVerified;

            next();

        } catch (error) {
            return res.status(401).json({ message: error.message || "dealer autherization failed", success: false })
        }
    }
}
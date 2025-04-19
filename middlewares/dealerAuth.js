import jwt from "jsonwebtoken";

export const dealerAuth = (requiredRole = 'dealer') => {
    return (req, res, next) => {
        try {
            const {dealer_token} = req.cookies;
            if (!dealer_token) {
                return res.status(401).json({ message: "token not found", success: false })
            }
            console.log("Dealer token from cookie:", dealer_token);

                const tokenVerified = jwt.verify(dealer_token, process.env.JWT_SECRET_KEY)
        
            if (!tokenVerified || tokenVerified.role !== requiredRole) {
                return res.status(403).json({ message: "Access forbidden", success: false })
            }

            req.user = tokenVerified;

            next();

        } catch (error) {
            return res.status(401).json({ message: error.message || "dealer autherization failed", success: false })
        }
    }
}
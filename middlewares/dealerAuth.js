import jwt from "jsonwebtoken";

export const dealerAuth = (requiredRole = 'dealer') => {
    return (req, res, next) => {
        try {
            const { dealer_token } = req.cookies;
            console.log("Incoming cookies:", req.cookies);

            if (!dealer_token) {
                return res.status(401).json({ message: "Authorization token not found", success: false });
            }

            console.log("Dealer token from cookie:", dealer_token);

            const tokenVerified = jwt.verify(dealer_token, process.env.JWT_SECRET_KEY);

            if (!tokenVerified || tokenVerified.role?.toLowerCase() !== requiredRole.toLowerCase()) {
                return res.status(403).json({ message: "Access forbidden", success: false });
            }

            req.user = tokenVerified;
            req.user._id = tokenVerified.id; 

            next();

        } catch (error) {
            return res.status(401).json({ message: error.message || "dealer authorization failed", success: false });
        }
    };
}

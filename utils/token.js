import jwt from "jsonwebtoken";
const maxAge = 3 * 24 * 60 * 60;

export const generateToken = (payload) => {
    try {
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            throw new Error("Payload must be a plain object");
        }

        return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: maxAge
        });
    } catch (error) {
        console.error("Token generation error:", error);
        throw new Error("Failed to generate token");
    }
};

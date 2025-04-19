import jwt from "jsonwebtoken";
const maxAge=3*24*60*60;

export const generateToken = (id, role="user") => {
    try {
        const payload = { id, role };
        const token= jwt.sign(payload, process.env.JWT_SECRET_KEY,{
            expiresIn:maxAge
        });
        return token;
    } catch (error) {
        console.log(error)
    }
}
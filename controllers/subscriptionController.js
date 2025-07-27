import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Subscriber } from "../models/subscriberModel.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const subscribeUser = async (req, res) => {
    const { email } = req.body;

    const subject = "Thank You for Subscribing to QRidey!";
    const messageText = `Hi,

Thank you for subscribing to QRidey! 🎉

You’re now on the list to receive updates about our latest cars, exclusive offers, and travel tips straight to your inbox.

Stay tuned and get ready to enjoy a smoother and more affordable car rental experience across Qatar!

Warm regards,  
The QRidey Team  
ride-qatar.vercel.app`;

    const messageHtml = `
    <b>Hi,</b><br><br>
    Thank you for subscribing to <b>QRidey</b>! 🎉<br><br>
    You’re now on the list to receive updates about our latest cars, exclusive offers, and travel tips straight to your inbox.<br><br>
    Stay tuned and get ready to enjoy a smoother and more affordable car rental experience across Qatar!<br><br>
    Warm regards,<br>
    <b>The QRidey Team</b><br>
    <a href="https://ride-qatar.vercel.app/">ride-qatar.vercel.app</a>
    `;

    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email is already subscribed.' });
        }


        await Subscriber.create({ email });

        const info = await transporter.sendMail({
            from: `"QRidey" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: messageText,
            html: messageHtml,
        });

        console.log("✅ Email sent:", info.messageId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Email error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

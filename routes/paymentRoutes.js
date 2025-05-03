import express from "express"
import { userAuth } from "../middlewares/userAuth.js";
import { paymentFunction } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/makepayment", userAuth, paymentFunction);


export { router as paymentRouter }
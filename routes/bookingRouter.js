import express from "express"
import { createBooking, cancelBooking, viewBookings, adminBookings, dealerBookings } from "../controllers/bookingControllers.js";
import { userAuth } from "../middlewares/userAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { dealerAuth } from "../middlewares/dealerAuth.js"

const router = express.Router();

router.post("/createBooking", userAuth, createBooking)
router.delete("/cancelBooking/:bookingId", userAuth, cancelBooking)
router.get("/viewBooking", userAuth, viewBookings)
router.get("/adminbooking", adminAuth, adminBookings)
router.get("/dealerbooking", dealerAuth(), dealerBookings)

export { router as bookingRouter }
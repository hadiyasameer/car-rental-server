import express from "express"
import { createBooking, cancelBooking, viewBookings, adminBookings, dealerBookings} from "../controllers/bookingControllers.js";
import { clearBooking } from "../controllers/bookingControllers.js";
import { userAuth } from "../middlewares/userAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { dealerAuth } from "../middlewares/dealerAuth.js"
// import { updateBookingStatus } from "../controllers/bookingControllers.js";

const router = express.Router();

router.post("/createbooking/:carId", userAuth, createBooking)
router.delete("/cancelbooking/:bookingId", userAuth, cancelBooking)
router.get("/viewbooking", userAuth, viewBookings)
router.get("/adminbooking", adminAuth, adminBookings)
router.get("/dealerbooking", dealerAuth(), dealerBookings)
router.post('/clearbooking',userAuth, clearBooking);

// router.put('/update-booking-status/:id', updateBookingStatus);


export { router as bookingRouter }
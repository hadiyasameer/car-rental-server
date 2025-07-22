// routes/quickBookingRoute.js
import express from 'express';
import { createQuickBooking } from '../controllers/quickBookingController.js';

const router = express.Router();

router.post('/quick-booking', createQuickBooking);

export { router as quickBookingRouter }
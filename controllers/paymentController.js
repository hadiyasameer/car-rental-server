import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Notification } from '../models/notificationModel.js';
import { Car } from '../models/carModel.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const paymentFunction = async (req, res) => {
  try {
    const { bookings } = req.body;
    const userId = req.user?._id || null;

    const line_items = bookings.map((booking) => ({
      price_data: {
        currency: "QAR",
        product_data: {
          name: booking.carId?.title || "Rental Car",
          images: booking.carId?.image?.[0]
            ? [booking.carId.image[0]]
            : ["https://via.placeholder.com/300x200?text=Car+Image"],
        },
        unit_amount: Math.round(booking.totalPrice * 100),
      },
      quantity: 1,
    }));


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?bookingId=${bookings[0]._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/failed`,
    });

    for (const booking of bookings) {
      if (booking.deliveryType === 'Delivery') {
        const car = await Car.findById(booking.carId._id).populate('dealer');
        if (car?.dealer) {
          await Notification.create({
            userId,
            dealerId: car.dealer._id,
            carId: car._id,
            message: `New delivery booking for ${car.title} to ${booking.deliveryAddress}`,
          });
        }
      }
    }

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
};

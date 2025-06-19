import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const paymentFunction = async (req, res) => {
  try {
    const { bookings } = req.body;
    console.log("Received bookings:", bookings);

    const line_items = bookings.map((booking) => ({
      price_data: {
        currency: 'QAR', // or 'QAR' if Stripe supports it
        product_data: {
          name: booking.carId.title || 'Car Booking',
          images: [booking.carId.image[0] || 'https://via.placeholder.com/150'], 
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

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Payment processing error:", error);  // Log more detailed error info
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
};

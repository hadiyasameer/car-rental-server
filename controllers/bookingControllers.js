import transporter from '../config/transporter.js';
import { Booking } from '../models/bookingModel.js';
import { Car } from '../models/carModel.js';
import { User } from '../models/userModel.js';
import { sendSMS } from '../utils/sendSMS.js';
//create booking by user
export const createBooking = async (req, res) => {
  try {
    const carId = req.params.carId;
    const { startDate, endDate } = req.body;
    console.log("Authenticated user:", req.user);

    const userId = req.user.id;
    const user = req.user;

    const existingBooking = await Booking.findOne({
      carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Car is not available during the selected dates." });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const rentalDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
    const totalPrice = rentalDays * car.pricePerDay;

    const booking = new Booking({
      userId,
      carId,
      startDate,
      endDate,
      rentalDays,
      totalPrice,
      status: "pending",
      carSnapshot: {
        title: car.title,
        make: car.make,
        image: car.image,
        pricePerDay: car.pricePerDay,
        fuelType: car.fuelType,
        capacity: car.capacity,
        transmission: car.transmission,
        carType: car.carType,
        dealer: car.dealer,
      }
    });

    await booking.save();
    console.log({ userId, carId, startDate, endDate, totalPrice });

    const carDetails = car;
    await sendSMS(user.mobileNumber, `Hi ${user.name}, your Ride Qatar booking for ${carDetails.title} from ${startDate} to ${endDate} is received. Total: ${totalPrice} QR.`);

    await transporter.sendMail({
      from: `"Ride Qatar" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Booking Request is Received!",
      html: `
    <p>Hi ${user.name},</p>
    <p>Thanks for booking <b>${carDetails.title}</b> from Ride Qatar.</p>
    <p><strong>Start Date:</strong> ${startDate}<br>
    <strong>End Date:</strong> ${endDate}<br>
    <strong>Total:</strong> ${totalPrice} QR</p>
    <p>We’ll notify you once your booking is confirmed.</p>
    <br>
    <p>Regards,<br>Ride Qatar Team</p>
  `
    }).then(() => {
      console.log("✅ Booking email sent");
    }).catch((err) => {
      console.error("❌ Failed to send booking email:", err.message);
    });

    return res.status(201).json({ data: booking, message: "Booking created" });
  } catch (error) {
    console.error('Error creating booking:', error); // helpful for debugging
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get user's bookings
export const viewBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({
      userId,
      status: 'pending'
    }).populate('carId');

    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      const car = bookingObj.carId || bookingObj.carSnapshot;

      return {
        ...bookingObj,
        car,
      };
    });

    return res.status(200).json(formattedBookings);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

//user's confirmed booking
// export const viewConfirmedBookings = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const bookings = await Booking.find({
//       userId,
//       status: 'confirmed'
//     }).populate('carId');

//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error('Error fetching confirmed bookings:', error);
//     res.status(500).json({ message: error.message || 'Server error' });
//   }
// };


// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const user = req.user;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    console.log("📧 Sending email to user:", req.user);

    const carDetails = await Car.findById(booking.carId) || booking.carSnapshot;
    await sendSMS(user.mobileNumber, `Hi ${user.name}, your Ride Qatar booking for ${carDetails.title} has been cancelled.`);

    await transporter.sendMail({
      from: `"Ride Qatar" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Booking Has Been Cancelled",
      html: `
    <p>Hi ${user.name},</p>
    <p>Your booking for <b>${carDetails.title}</b> from <strong>${booking.startDate.toDateString()}</strong> to <strong>${booking.endDate.toDateString()}</strong> has been cancelled.</p>
    <p>If this was a mistake or you have any questions, feel free to contact us.</p>
    <br>
    <p>Regards,<br>Ride Qatar Team</p>
  `
    }).then(() => {
      console.log("✅ Cancellation email sent");
    }).catch((err) => {
      console.error("❌ Failed to send cancellation email:", err.message);
    });

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

//clear booking
export const clearBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "confirmed";
    await booking.save();

    return res.status(200).json({ message: "Booking confirmed" });
  } catch (error) {
    console.error("Clear booking error:", error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

//update booking status
// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     await Booking.findByIdAndUpdate(req.params.id, { status });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update booking status' });
//   }
// };


//Admin only booking list
export const adminBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const bookings = await Booking.find({ status: { $ne: 'cancelled' } })
      .populate({
        path: 'carId',
        select: 'title image',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      });
    const enrichedBookings = bookings.map(b => {
      const bObj = b.toObject();
      const carLive = bObj.carId;
      const car = carLive || bObj.carSnapshot;

      return {
        ...bObj,
        car: {
          ...car,
          wasDeleted: !carLive
        }
      }
    });

    return res.status(200).json({ data: enrichedBookings, message: "All bookings fetched successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

//Dealer only booking list

export const dealerBookings = async (req, res) => {
  try {
    const dealerId = req.user.id;

    const dealerCars = await Car.find({ dealer: dealerId }).select('_id');

    if (dealerCars.length === 0) {
      return res.status(200).json({ data: [], message: "No cars found for this dealer" });
    }

    const carIds = dealerCars.map(car => car._id);

    const bookings = await Booking.find({
      carId: { $in: carIds },
      status: 'confirmed'
    })
      .populate({
        path: 'carId',
        select: 'title totalPrice image rentalDays',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      });
    const enrichedBookings = bookings.map(b => {
      const bObj = b.toObject();
      return {
        ...bObj,
        car: bObj.carId || bObj.carSnapshot,
      };
    });

    return res.status(200).json({ data: enrichedBookings, message: "Bookings for dealer's cars fetched successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get booked date ranges for a specific car
export const getBookedDatesForCar = async (req, res) => {
  try {
    const { carId } = req.params;
    if (!carId) return res.status(400).json({ error: 'Missing carId' });

    const bookings = await Booking.find({
      carId,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startDate endDate');

    const bookedRanges = bookings.map(b => ({
      startDate: b.startDate,
      endDate: b.endDate
    }));

    res.status(200).json({ data: bookedRanges });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};



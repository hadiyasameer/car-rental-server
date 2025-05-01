import { Booking } from '../models/bookingModel.js';
import { Car } from '../models/carModel.js';

//create booking by user
export const createBooking = async (req, res) => {
  try {
    const carId = req.params.carId;
    const { startDate, endDate } = req.body;
    console.log("Authenticated user:", req.user);

    const userId = req.user.id;

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
      totalPrice,
      status: "pending",
    });

    await booking.save();
    res.status(201).json({ data: booking, message: "Booking created" });
  } catch (error) {
    console.error('Error creating booking:', error); // helpful for debugging
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get user's bookings
export const viewBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId ,status: { $ne: 'cancelled'}}).populate('carId');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

//Admin only booking list
export const adminBookings = async (req, res) => {
  try {
    // Only allow access if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Populate both car and user details
    const bookings = await Booking.find()
      .populate({
        path: 'carId',
        select: 'title make model year pricePerDay',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      });

    res.status(200).json({ data: bookings, message: "All bookings fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

//Dealer only booking list

export const dealerBookings = async (req, res) => {
  try {
    const dealerId = req.user.id; // assuming this is set by auth middleware

    // Get all cars added by the dealer
    const dealerCars = await Car.find({ dealer: dealerId }).select('_id');

    if (dealerCars.length === 0) {
      return res.status(200).json({ data: [], message: "No cars found for this dealer" });
    }

    const carIds = dealerCars.map(car => car._id);

    // Find bookings for those cars
    const bookings = await Booking.find({ carId: { $in: carIds } })
      .populate({
        path: 'carId',
        select: 'title make model year pricePerDay',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      });

    res.status(200).json({ data: bookings, message: "Bookings for dealer's cars fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
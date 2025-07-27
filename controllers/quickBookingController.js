import { Car } from '../models/carModel.js';
import { QuickBooking } from '../models/quickBookingModel.js';
import { sendSMS } from '../utils/sendSMS.js';

export const createQuickBooking = async (req, res) => {
  try {
    const {
      name, email, mobileNumber,
      carId, startDate, endDate,
      deliveryAddress, deliveryCoordinates
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const durationMs = end - start;
    const totalHours = durationMs / (1000 * 60 * 60);
    let rentalDays = 1;

    if (totalHours > 24) {
      const extraHours = totalHours - 24;
      if ((extraHours % 24) >= 12) rentalDays += 1;
    }

    const totalPrice = rentalDays * car.pricePerDay;

    const quickBooking = new QuickBooking({
      name,
      email,
      mobileNumber,
      carId,
      startDate: start,
      endDate: end,
      rentalDays,
      totalPrice,
      deliveryAddress,
      deliveryCoordinates,
      status: "pending",
      dealer: car.dealer,
    });

    await quickBooking.save();

    await sendSMS(mobileNumber, `Hi ${name}, your QRidey quick booking for ${car.title} from ${start.toLocaleString()} to ${end.toLocaleString()} is received. Total: ${totalPrice} QR.`);

    return res.status(201).json({ quickBooking: quickBooking });
  } catch (err) {
    console.error("❌ Quick booking error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get all quick bookings (Admin)
export const getAllQuickBookings = async (req, res) => {
  try {
    const bookings = await QuickBooking.find()
      .populate('carId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ quickBookings: bookings || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// Get quick bookings for dealer
export const getDealerQuickBookings = async (req, res) => {
  try {
    const dealerId = req.user?.id;

    if (!dealerId) return res.status(401).json({ message: "Dealer ID not found in token" });
    console.log("🚀 Dealer ID:", dealerId);

    const cars = await Car.find({ dealer: dealerId }).select('_id');
    console.log("📦 Dealer Cars:", cars.map(c => c._id));

    const carIds = cars.map((car) => car._id);

    const bookings = await QuickBooking.find({
      carId: { $in: carIds },
      status: "pending"
    })
      .populate("carId")
      .sort({ createdAt: -1 });

    console.log("🔍 Found Quick Bookings:", bookings.length);

    res.status(200).json({ quickBookings: bookings });
  } catch (err) {
    console.log("❌ Error in getDealerQuickBookings:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};





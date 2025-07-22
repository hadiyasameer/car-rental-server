// models/quickBookingModel.js
import mongoose, { Schema } from 'mongoose';

const quickBookingSchema = new Schema({
  dealer: {  type: mongoose.Schema.Types.ObjectId, ref: 'Dealer',},
  name: { type: String, required: true },
  email: { type: String },
  mobileNumber: { type: String, required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  deliveryAddress: String,
  deliveryCoordinates: {
    lat: Number,
    lng: Number
  },
  rentalDays: Number,
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const QuickBooking = mongoose.model('QuickBooking', quickBookingSchema);

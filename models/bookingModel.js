import mongoose, { Schema } from 'mongoose'

const bookingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true }, 
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  });
  
  
  export const Booking = mongoose.model('Booking', bookingSchema);
  
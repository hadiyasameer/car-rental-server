import mongoose from 'mongoose'
const { Schema } = mongoose;

const carSchema = new Schema({
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
  title: { type: String, required: true, maxLength: 50 },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  carType: { type: String, enum: ['sedan', 'SUV', 'offroad'], required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },
  transmission: { type: String, enum: ['manual', 'automatic'], required: true },
  seatingCapacity: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  description: { type: String, },
  image: [{ type: String }],
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const Car = mongoose.model('Car', carSchema);

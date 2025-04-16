import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true,maxLength:50 },
  email: { type: String, required: true, unique: true,minLength:5,maxLength:30,match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true,minLength:6 },
  mobileNumber: { type: String, required: true },
  address: { type: String },
  profilePicture: { type: String, default: "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);


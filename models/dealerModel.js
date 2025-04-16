import mongoose, { Schema } from 'mongoose'

const dealerSchema = new Schema({
    name: { type: String, maxLength: 50 },
    email: { type: String, required: true, unique: true, minLength: 5, maxLength: 30 },
    password: { type: String, required: true, minLength: 6 },
    mobileNumber: { type: String },
    profilePicture: { type: String, default: "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png" },
    role: { type: String, enum: ['admin', 'dealer'], default: 'dealer' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

export const Dealer = mongoose.model('Dealer', dealerSchema);


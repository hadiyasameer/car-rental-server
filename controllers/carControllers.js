import { Car } from "../models/carModel.js"
import { uploadToCloudinary } from "../utils/imageUpload.js";

export const createCar = async (req, res) => {
    try {
        console.log("Add car details")

        const { title, make, model, year, carType, fuelType, transmission, seatingCapacity, pricePerDay, availability, description, location } = req.body;
        if (!title || !make || !model || !year || !carType || !fuelType || !transmission || !seatingCapacity || !pricePerDay) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (!req.file) {
            return res.status(400).json({ error: "image not found" })
        }
        let cloudinaryRes;
        try {
            cloudinaryRes = await uploadToCloudinary(req.file.path)
            console.log("image", cloudinaryRes);
        } catch (error) {
            return res.status(500).json({ message: "Image upload failed", error: error.message });
        }

        const dealerId = req.user.id;

        const isCarExist = await Car.findOne({ dealer: dealerId, title });
        if (isCarExist) {
            return res.status(400).json({ message: "You have already added this car" })
        }

        const newCar = new Car({ dealer: dealerId, title, make, model, year, carType, fuelType, transmission, seatingCapacity, pricePerDay, availability, description, image: cloudinaryRes, location })
        await newCar.save();

        return res.status(201).json({ data: newCar, message: "Car details added" })

    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const listCars = async (req, res) => {
    try {
        const { carType } = req.query;
        const normalizedType = carType?.trim();

        const filter = normalizedType
            ? { carType: { $regex: new RegExp(`^${normalizedType}$`, 'i') } }
            : {};


        const carList = await Car.find(filter);
        res.status(200).json(carList)
    } catch (error) {
        console.log(error);

        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}

export const updateCar = async (req, res) => {
    try {
        const { carId } = req.params;
        const dealerId = req.user.id;
        const { title, pricePerDay, availability, description, image, location } = req.body;
        let imageUrl;

        console.log("Dealer ID:", dealerId);
        console.log("Car ID:", carId);
        console.log("Request Body:", req.body);
        const carExist = await Car.findOne({ _id: carId, dealer: dealerId });

        if (!carExist) {
            return res.status(404).json({ message: "Car not found or unauthorized" });
        }

        if (req.file) {
            const cloudinaryRes = await uploadToCloudinary(req.file.path)
            imageUrl = cloudinaryRes;
        }
        const updatedCar = await Car.findByIdAndUpdate(carId, { title, pricePerDay, availability, description, image: imageUrl, location }, { new: true })
        return res.status(200).json({ data: updatedCar, message: "Car updated successfully" });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


export const viewCar = async (req, res) => {
    try {
        const { carId } = req.params;

        const carData = await Car.findById(carId)
        if (!carData) {
            return res.status(404).json({ message: "Car not found" });
        }

        return res.json({ data: carData, message: "Car details fetched" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }

}

export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.params
        const deleteCar = await Car.findByIdAndDelete(carId)
        if (!deleteCar) {
            return res.status(400).json({ error: "Car not found" })
        }
        res.status(200).json({ message: "Car deleted" })
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
}
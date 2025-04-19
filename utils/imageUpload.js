import cloudinary from "../config/cloudinaryConfig.js"

 export const uploadToCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            { folder: 'cars' },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
})
}
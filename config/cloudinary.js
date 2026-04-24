// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer, folder = "venuewala") => {
  try {
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};

const uploadMultipleImages = async (files, folder = "venuewala/halls") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw new Error("Failed to upload images");
  }
};

export { cloudinary, uploadImage, deleteImage, uploadMultipleImages };

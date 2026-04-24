// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// ✅ Config with better error handling
const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  // Validate config
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error("❌ Cloudinary config missing:", {
      cloud_name: !!config.cloud_name,
      api_key: !!config.api_key,
      api_secret: !!config.api_secret,
    });
    throw new Error("Cloudinary credentials missing in .env");
  }

  cloudinary.config(config);
  console.log("✅ Cloudinary configured successfully");
};

configureCloudinary();

const uploadImage = async (fileBuffer, folder = "healthmate/reports") => {
  try {
    if (!fileBuffer) {
      throw new Error("No file buffer provided");
    }

    console.log("📤 Uploading to Cloudinary...");
    console.log("Folder:", folder);

    // ✅ Direct upload without extra parameters first
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder: folder,
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload successful:", result.public_id);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
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

const uploadMultipleImages = async (files, folder = "healthmate/reports") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw new Error("Failed to upload images");
  }
};

export { cloudinary, uploadImage, deleteImage, uploadMultipleImages };

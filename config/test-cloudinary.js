import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Testing Cloudinary connection...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Present" : "Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Present" : "Missing");

// Test upload with a simple string
async function testUpload() {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "healthmate/test" }
    );
    console.log("✅ Test upload successful!");
    console.log("URL:", result.secure_url);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testUpload();
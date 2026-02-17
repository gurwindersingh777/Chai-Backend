import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import ApiError from './ApiError.js';

async function uploadOnCloudinary(localFilePath) {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    fs.unlinkSync(localFilePath);
    console.log("File has Successfully Upload on Cloudinary", response.url);
    return response;
  } catch {
    console.log("Failed to upload file");
    fs.unlinkSync(localFilePath);
    return null;
  }

};

async function deleteOnCloudinary(public_id) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new ApiError(400, "Failed to delete files");
  }

}

export { uploadOnCloudinary, deleteOnCloudinary }
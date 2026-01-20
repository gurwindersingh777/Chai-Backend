import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

(async function (localFilePath) {

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
  } catch {
    fs.unlinkSync(localFilePath);
    return null;
  }

})();
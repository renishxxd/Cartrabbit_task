import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine for images and videos
const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'chat_media';
    let resource_type = 'auto'; // Auto-detects image, video
    let public_id = `${Date.now()}-${file.originalname.split('.')[0]}`;

    // If it's a generic document (like PDF, ZIP, etc.), we force it to 'raw'
    // This prevents Cloudinary from blocking PDF delivery and processing it as an image.
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      resource_type = 'raw';
      public_id = `${Date.now()}-${file.originalname}`; // 'raw' files need extension in public_id
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: public_id
    };
  },
});

export const uploadMedia = multer({ 
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit max
});

export { cloudinary };

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const cloudinaryUploadOptions = {
  folder: 'revault/inventory',
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
};

export { cloudinary, cloudinaryUploadOptions };

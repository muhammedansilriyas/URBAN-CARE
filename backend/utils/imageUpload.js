import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if Cloudinary is configured with proper credentials (not dummy)
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return name && name !== 'dummy_cloud_name' && key && key !== 'dummy_key' && secret && secret !== 'dummy_secret';
};

// Upload file (either to Cloudinary or locally)
// Returns { imageUrl, imagePublicId }
export const uploadImage = async (file, req) => {
  if (isCloudinaryConfigured()) {
    try {
      // Configure cloudinary config
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'doctors' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(error);
            }
            resolve({
              imageUrl: result.secure_url,
              imagePublicId: result.public_id,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // Fallback: Save file locally in backend/public/uploads
  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `doctor-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  // Return the absolute public URL of the locally uploaded file
  const protocol = req.protocol;
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${filename}`;

  return {
    imageUrl,
    imagePublicId: filename, // Save filename as publicId for local deletion
  };
};

// Delete old image (either from Cloudinary or locally)
export const deleteImage = async (publicId) => {
  if (!publicId) return;

  if (isCloudinaryConfigured() && !publicId.startsWith('doctor-')) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.uploader.destroy(publicId);
      console.log(`Cloudinary image deleted: ${publicId}`);
      return;
    } catch (err) {
      console.warn('Cloudinary image deletion failed:', err);
    }
  }

  // Local deletion
  try {
    const filePath = path.join(__dirname, '../public/uploads', publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Local image deleted: ${publicId}`);
    }
  } catch (err) {
    console.error('Local image deletion failed:', err);
  }
};

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadPhoto = async (fileBuffer, username) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'cv-platform', public_id: `photo_${username}`, overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
      (error, result) => { if (error) reject(error); else resolve(result.secure_url); }
    ).end(fileBuffer);
  });
};

module.exports = { uploadPhoto };

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET_NAME } = require('../config/s3');

// Local storage configuration
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage so we can decide to upload to S3 or local disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpeg, jpg, png, webp)'));
  }
});

const uploadToS3OrLocal = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;
  
  // Check if AWS Credentials are set
  const hasAwsConfig = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_ACCESS_KEY_ID !== 'mock_access_key';

  if (hasAwsConfig) {
    try {
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: `products/${fileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };
      
      await s3Client.send(new PutObjectCommand(uploadParams));
      // Construct S3 / CloudFront URL
      const cdnUrl = process.env.CLOUDFRONT_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;
      req.fileUrl = `${cdnUrl}/products/${fileName}`;
      return next();
    } catch (error) {
      console.error("S3 upload failed, falling back to local storage:", error);
    }
  }

  // Fallback to Local Storage
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const localPath = path.join(uploadDir, fileName);
    fs.writeFileSync(localPath, req.file.buffer);
    
    req.fileUrl = `/uploads/${fileName}`;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, uploadToS3OrLocal };

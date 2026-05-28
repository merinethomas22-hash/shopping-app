const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const { upload, uploadToS3OrLocal } = require('../middleware/upload.middleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { getProductReviews, createReview } = require('../controllers/review.controller');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.post('/upload', protect, admin, upload.single('image'), uploadToS3OrLocal, (req, res) => {
  if (!req.fileUrl) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.fileUrl });
});

router.route('/:productId/reviews')
  .get(getProductReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;

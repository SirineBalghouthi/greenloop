const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  createOrder,
  confirmPayment,
  getMyOrders,
  deleteProduct
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('images', 5), createProduct);
router.get('/', getAllProducts); // Public
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getProductById); // Public
router.post('/:id/order', protect, createOrder);
router.post('/order/:order_id/payment', protect, confirmPayment);
router.delete('/:id', protect, deleteProduct);

module.exports = router;


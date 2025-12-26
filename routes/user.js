const express = require('express');
const router = express.Router();
const { getProductsByUser, getAllUsers, addToCart, getCart, removeFromCart } = require('../controllers/user');
const { restrict } = require('../middleware/auth');

router.get('/', getAllUsers);
router.get('/purchased-products', restrict, getProductsByUser);

// Cart routes
router.post('/cart', restrict, addToCart);
router.get('/cart', restrict, getCart);
router.delete('/cart', restrict, removeFromCart);

module.exports = router;
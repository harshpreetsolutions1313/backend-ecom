const express = require('express');
const router = express.Router();
const { getProductsByUser, getAllUsers, addToCart, getCart, removeFromCart } = require('../controllers/user');
const { restrict } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { getAllUsersTransactions } = require('../controllers/transaction');

router.get('/', getAllUsers);
router.get('/purchased-products', restrict, getProductsByUser);
router.get('/all-transactions', restrict, admin, getAllUsersTransactions);

// Cart routes
router.post('/cart', restrict, addToCart);
router.get('/cart', restrict, getCart);
router.delete('/cart', restrict, removeFromCart);

module.exports = router;
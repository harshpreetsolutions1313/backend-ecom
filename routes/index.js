const express = require('express');
const router = express.Router();

// various routes
const productRoutes = require('./product');
const orderRoutes = require('./order');
// const contractRoutes = require('./contract');
const userRoutes = require('./user.js');
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');


router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

// router.use('/contract', contractRoutes);

module.exports = router;
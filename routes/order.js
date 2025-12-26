const express = require('express');
const router = express.Router();
const { restrict } = require('../middleware/auth');
const { createOrder, payForOrder, createBatchOrder} = require('../controllers/order');

router.post('/create', restrict, createOrder);
router.post('/create-batch', restrict, createBatchOrder);
router.post('/pay', payForOrder);

module.exports = router;

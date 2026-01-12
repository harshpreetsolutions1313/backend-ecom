const express = require('express');
const router = express.Router();

const { getDashboardEarnings, getWeeklySalesAndOrders } = require('../controllers/dashboard');

router.get('/earnings', getDashboardEarnings);
router.get('/analytics/weekly', getWeeklySalesAndOrders);

module.exports = router;
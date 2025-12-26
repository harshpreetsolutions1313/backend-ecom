const express = require('express');
const router = express.Router();
const { withdrawToken, withdrawBNB } = require('../controllers/contract');

router.post('/withdraw-token', withdrawToken);
router.post('/withdraw-bnb', withdrawBNB);

module.exports = router;
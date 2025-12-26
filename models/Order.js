const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  buyer: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }, // Add quantity field
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  paid: { type: Boolean, default: true },
  transactionHash: { type: String, required: true },
  trackedAt: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Order', orderSchema);
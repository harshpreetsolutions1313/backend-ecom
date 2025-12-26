const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [String],
  stock: { type: Number, required: true },
  category: String,
  variants: [Object],
});

module.exports = mongoose.model('Product', productSchema);

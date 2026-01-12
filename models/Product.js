const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  images: [String],
  stock: { type: Number, required: true },
  category: String,
  tags: [String],
  barCode: { type: String, unique: true },
  variants: [Object],
});

module.exports = mongoose.model('Product', productSchema);

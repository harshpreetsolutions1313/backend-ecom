const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    cat_desc: {
      type: String,
      default: ''
    },

    imageUrl: {
      type: String,
      default: ''
    },

    publish: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema)

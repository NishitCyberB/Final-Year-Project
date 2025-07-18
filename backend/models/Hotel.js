const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: String,
  location: {
    district: String,
    state: String,
  },
  price: [String],
  rating: Number,
  amenities: [String],
  description: String,

  // 🖼️ Image as buffer
  image: {
    type: Buffer, // This supports base64 conversion
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hotel', hotelSchema);

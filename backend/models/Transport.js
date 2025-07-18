const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  type:       { type: String, enum: ['taxi', 'bus', 'train'], required: true },
  provider:   { type: String, required: true },
  location:   { type: String, required: true },
  price:      { type: Number, required: true },
  seats:      { type: Number },
  imageUrl:   { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);

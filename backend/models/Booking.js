const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType:{ type: String, enum: ['hotel', 'transport', 'agent'], required: true },
  serviceId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  date:       { type: Date, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
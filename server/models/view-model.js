const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

viewSchema.index({ listingId: 1, userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('View', viewSchema);
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  propertyType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  photos: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
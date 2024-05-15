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
    type: mongoose.Schema.Types.ObjectId, // тип данных ObjectId для ссылки на пользователя
    ref: 'User', // имя модели пользователя, на которую ссылается userId
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

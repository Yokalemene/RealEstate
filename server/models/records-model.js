const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
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
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;

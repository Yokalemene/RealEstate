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
  yearBuilt: {
    type: Number
  },
  totalArea: {
    type: Number
  },
  livingArea: {
    type: Number
  },
  kitchenArea: {
    type: Number
  },
  balcony: {
    type: String
  },
  repair: {
    type: String
  },
  houseType: {
    type: String
  },
  floorCount: {
    type: Number
  },
  floorType: {
    type: String
  },
  entrances: {
    type: Number
  },
  heating: {
    type: String
  },
  emergency: {
    type: String
  },
  gasSupply: {
    type: String
  },
  ceilingHeight: {
    type: Number
  },
  parking: {
    type: String
  },
  plotArea: {
    type: Number
  },
  landCategory: {
    type: String
  },
  plotStatus: {
    type: String
  },
  sewage: {
    type: String
  },
  electricity: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;

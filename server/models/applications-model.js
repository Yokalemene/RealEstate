const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Ожидает обработки', 'В работе', 'Завершено', 'Отклонено'],
    default: 'Ожидает обработки'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applications' },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chats' }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
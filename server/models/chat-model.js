const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['Клиент', 'Сотрудник'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      fileUrl: String,
      fileName: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['Активный', 'Завершенный'],
    default: 'Активный'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.pre('save', function (next) {
  this.lastMessageAt = Date.now();
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/chat-model');

// // Получение всех чатов
// router.get('/api/chats', async (req, res) => {
//   try {
//     const chats = await Chat.find().populate('userId');
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении чатов' });
//   }
// });

// // Отправка сообщения
// router.post('/api/chats/:id/messages', async (req, res) => {
//   const { message, senderId } = req.body;
//   try {
//     const chat = await Chat.findById(req.params.id);
//     if (!chat) {
//       return res.status(404).json({ message: 'Чат не найден' });
//     }
//     chat.messages.push({ sender: senderId, message });
//     await chat.save();
//     res.json(chat);
//     req.app.get('socketio').emit('newMessage', chat);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при отправке сообщения' });
//   }
// });

// // Завершение чата
// router.post('/api/chats/:id/complete', async (req, res) => {
//   try {
//     const chat = await Chat.findById(req.params.id);
//     if (!chat) {
//       return res.status(404).json({ message: 'Чат не найден' });
//     }
//     chat.status = 'completed';
//     await chat.save();
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при завершении чата' });
//   }
// });

// module.exports = router;

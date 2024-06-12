const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const Admin = require('../models/admin-model');
const Application = require('../models/applications-model');
const Listing = require('../models/realestate-model');

 
// Маршрут для аутентификации администратора
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
      }
  
      // Создание токена
      const token = jwt.sign(
        {
          id: admin._id,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  });

// Маршрут для получения списка пользователей
// router.get('/users', async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Ошибка сервера' });
//     }
// });

// Маршрут для получения списка объявлений
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Маршрут для получения списка запросов на одобрение
router.get('/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.get('/verify-admin', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Получение токена из заголовка авторизации
    if (!token) {
      return res.status(401).json({ message: 'Отсутствует токен доступа' });
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getUserByToken(decodedToken.id);
  
      if (user && user.role === 'admin') {
        return res.status(200).json({ isAdmin: true });
      } else {
        return res.status(403).json({ message: 'Доступ запрещен: Только администраторы' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Неверный токен' });
    }
  });
  
module.exports = router;

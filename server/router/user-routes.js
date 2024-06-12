// const express = require('express');
// const router = express.Router();
// const { body } = require('express-validator');
// const userController = require('../controllers/user-controller');
// const authMiddleware = require('../middlewares/auth-middleware');
// const UserModel = require('../models/user-model');
// const jwt = require('jsonwebtoken');
// const userDto = require('../dtos/user-dto');

// router.post('/registration',
//   body('email').isEmail(),
//   body('password').isLength({ min: 3, max: 32 }),
//   userController.registration
// );
// router.post('/login', userController.login);
// router.post('/logout', userController.logout);
// router.get('/refresh', userController.refresh);

// router.get('/profile', authMiddleware, async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const userId = decodedToken.id;
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'Пользователь не найден' });
//     }

//     const UserDto = new userDto(user);
//     res.json(UserDto);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении информации о профиле' });
//   }
// });

// router.put('/profile', authMiddleware, async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const userId = decodedToken.id;
//     const updatedUser = req.body;
//     const user = await UserModel.findByIdAndUpdate(userId, updatedUser, { new: true });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при обновлении профиля' });
//   }
// });

// router.get('/getuserphone', async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const userId = decodedToken.id;
//     const user = await UserModel.findById(userId);

//     if (user) {
//       res.json({ phoneNumber: user.phoneNumber });
//     } else {
//       res.status(404).json({ message: 'Пользователь не найден' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении данных о текущем пользователе' });
//   }
// });

// module.exports = router;
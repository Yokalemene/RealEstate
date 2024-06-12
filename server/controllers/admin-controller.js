const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin-model');

const adminController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Полученные данные:', req.body);
      // Находим администратора по электронной почте
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      // Создаем токен администратора
      const token = generateAdminToken(admin._id);
      // Успешная аутентификация
      res.status(200).json({ message: 'Admin logged in successfully', token });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ message: 'Error logging in admin' });
    }
    
  }
};

// Функция для создания токена администратора
function generateAdminToken(adminId) {
    const token = jwt.sign({ adminId }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
    console.log('Сгенерированный токен администратора:', token);
  return token
 }

module.exports = adminController;

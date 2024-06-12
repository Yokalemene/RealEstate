require('dotenv').config(); // Загрузка переменных окружения

const mongoose = require('mongoose');
const User = require('../models/user-model'); // Подключение обновлённой модели
const Admin = require('../models/admin-model');
const Employee = require('../models/employee-model');

// Подключение к базе данных
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/RealEstate';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

async function updateUsers() {
    try {
        // Обновление существующих пользователей, администраторов и сотрудников
        const users = await User.find({ role: { $exists: false } });

        for (const user of users) {
            user.role = 'Пользователь';
            if (user.isActivated === false) user.isActivated = true;
            await user.save();
        }

        console.log('Data update completed');
        mongoose.disconnect();
    } catch (error) {
        console.error('Data update failed:', error);
        mongoose.disconnect();
    }
}

updateUsers();

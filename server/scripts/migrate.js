require('dotenv').config(); // Добавь это в начале файла

const mongoose = require('mongoose');
const User = require('../models/user-model');
const Admin = require('../models/admin-model');
const Employee = require('../models/employee-model');

// Подключение к базе данных
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/RealEstate';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

async function migrateData() {
    try {
        const admins = await Admin.find();
        const employees = await Employee.find();

        for (const admin of admins) {
            const user = new User({
                email: admin.email,
                password: admin.password,
                firstName: admin.username,
                role: 'Администратор'
            });
            await user.save();
        }

        for (const employee of employees) {
            const user = new User({
                email: employee.email,
                password: employee.password,
                firstName: employee.username,
                role: 'Сотрудник'
            });
            await user.save();
        }

        console.log('Data migration completed');
        mongoose.disconnect();
    } catch (error) {
        console.error('Data migration failed:', error);
        mongoose.disconnect();
    }
}

migrateData();

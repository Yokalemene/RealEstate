const mongoose = require('mongoose');
const User = require('../models/user-model'); 

async function activateAllUsers() {
    try {
        // Подключение к MongoDB
        await mongoose.connect('mongodb://localhost:27017/RealEstate', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Активация всех пользователей
        const result = await User.updateMany({}, { isActivated: true });
        
        // Отключение от MongoDB
        await mongoose.connection.close();
    } catch (error) {
        console.error('Ошибка активации всех пользователей:', error);
    }
}

activateAllUsers();

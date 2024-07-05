// Подключаем библиотеку dotenv для загрузки переменных окружения из файла .env
require('dotenv').config();

// Подключаем библиотеку mongoose для работы с MongoDB
const mongoose = require('mongoose');

// Импортируем модель Listing из соответствующего файла (убедитесь, что путь правильный)
const Listing = require('../models/realestate-model');

// Загружаем URI базы данных из переменных окружения
const url = "mongodb://localhost:27017/RealEstate";

// Подключаемся к базе данных MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // Выводим сообщение об успешном подключении
    console.log('Подключение к базе данных прошло успешно');

    // Вызываем функцию updateListings для обновления записей
    updateListings();
  })
  .catch(error => {
    // Выводим сообщение об ошибке при подключении к базе данных
    console.error('Ошибка при подключении к базе данных', error);
  });

// Функция updateListings для обновления записей в коллекции
const updateListings = async () => {
  try {
    // Используем метод updateMany для обновления всех документов в коллекции Listing
    const result = await Listing.updateMany(
      // Пустой объект {} означает, что будут обновлены все документы
      {},
      {
        // Оператор $set устанавливает новые значения для полей isDeleted, deletedAt и isApproved
        $set: {
          isDeleted: false,
          deletedAt: null,
          isApproved: false
        }
      }
    );

    // Выводим сообщение о количестве обновленных записей
    console.log(`Обновлено ${result.nModified} объявлений`);
  } catch (error) {
    // Выводим сообщение об ошибке при обновлении записей
    console.error('Ошибка при обновлении объявлений:', error);
  } finally {
    // Закрываем соединение с базой данных после завершения обновления
    mongoose.connection.close();
  }
};

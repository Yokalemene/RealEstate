require('dotenv').config()
const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const path = require('path');
const RealEstate = require('../models/realestate-model');
const UserModel = require('../models/user-model');
const jwt = require('jsonwebtoken');
const userDto = require('../dtos/user-dto');
const Listing = require('../models/realestate-model');
const multer = require('multer');
const uploadPath = path.join(__dirname, '../uploads');

//Загрузка фотографий в хранилище на сервере
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  
  },
  filename: function (req, file, cb) {
    // Генерация уникального имени файла
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
// router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
// router.get('/users', authMiddleware, userController.getUsers);

// router.post('/real-estate', authMiddleware, async (req, res) => {
//     try {
//       // Создание нового объявления на основе данных из запроса
//       const newListing = new Listing({
//         propertyType: req.body.propertyType,
//         location: req.body.location,
//         price: req.body.price,
//         description: req.body.description,
//         contactInfo: req.body.contactInfo,
//         photos: req.body.photos, // Если вы используете загрузку фотографий
//         userId: req.user.id // ID пользователя из аутентификации (предполагается, что он передаётся через middleware)
//       });
//       await newListing.save(); // Сохранение нового объявления в базе данных
//       res.status(201).send(newListing);
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });




  router.get('/profile', authMiddleware, async (req, res) => {
    try {
        //Декодирование jsonwebtoken
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const userId = decodedToken.id;
        
        const user = await UserModel.findById(userId); // Поиск пользователя по _id
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Создаем объект DTO на основе модели пользователя
        const UserDto = new userDto(user);

        // Отправляем информацию о пользователе обратно клиенту
        res.json(UserDto);
    } catch (error) {
        console.error('Ошибка при получении информации о профиле:', error);
        res.status(500).json({ message: 'Ошибка при получении информации о профиле' });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const userId = decodedToken.id;
      const updatedUser = req.body;
      const user = await UserModel.findByIdAndUpdate(userId, updatedUser, { new: true });
      res.json(user);
  } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Получение списка объявлений
router.get('/listings', async (req, res) => {
  try {
    const { propertyType, location, priceFrom, priceTo } = req.query;
    let filter = {};

    if (propertyType) filter.propertyType = propertyType;
    if (location) filter.location = location;
    if (priceFrom) filter.price = { ...filter.price, $gte: priceFrom };
    if (priceTo) filter.price = { ...filter.price, $lte: priceTo };

    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (error) {
    console.error('Ошибка при получении списка объявлений:', error);
    res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
  }
});

// Добавление нового объявления
router.post('/listings', upload.array('photos', 5), async (req, res) => {
  try {
    const { propertyType, location, price, description, contactInfo } = req.body;
    const photos = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const userId = decodedToken.id;

    // Создаем новое объявление
    const newListing = new Listing({
      userId,
      propertyType,
      location,
      price,
      description,
      contactInfo,
      photos
    });
    // Сохраняем объявление в базу данных
    await newListing.save();
    res.status(201).json({ message: 'Объявление успешно добавлено' });
  } catch (error) {
    console.error('Ошибка при добавлении объявления:', error);
    res.status(500).json({ message: 'Ошибка при добавлении объявления' });
  }
});

router.get('/listings/unique-locations', async (req, res) => {
  try {
    // Используйте агрегацию для получения уникальных местоположений
    const uniqueLocations = await Listing.distinct('location');
    res.json(uniqueLocations);
  } catch (error) {
    console.error('Ошибка при получении уникальных местоположений:', error);
    res.status(500).json({ message: 'Ошибка при получении уникальных местоположений' });
  }
});

router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Ошибка при получении объявления:', error);
    res.status(500).json({ message: 'Ошибка при получении объявления' });
  }
});

router.get('/mylistings', async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Отсутствует заголовок Authorization' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }
    // console.log(token); // Заменено accessToken на token

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;

    // console.log(decodedToken);
    // console.log('userId:', userId); // Выводим значение userId в консоль

    const listings = await Listing.find({ userId: userId });

    // console.log('listings:', listings); // Выводим список объявлений в консоль

    res.json(listings);
  } catch (error) {
    console.error('Ошибка при получении списка объявлений:', error);
    res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
  }
});

router.delete('/deletelisting/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    res.json(deletedListing);
  } catch (error) {
    console.error('Ошибка при удалении объявления:', error);
    res.status(500).json({ message: 'Ошибка при удалении объявления' });
  }
});

router.get('/getuserphone',  async (req, res) => {
    try {
      // Получаем идентификатор пользователя из данных аутентификации
      const token = req.headers.authorization.split(' ')[1];

      // Расшифровываем токен
      const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  
      // Извлекаем userId из расшифрованного токена
      const userId = decodedToken.id;
  
      // Ищем пользователя по идентификатору
      const user = await UserModel.findById(userId);
  
      // Если пользователь найден, отправляем его данные в ответе
      if (user) {
        res.json({ phoneNumber: user.phoneNumber });
      } else {
        res.status(404).json({ message: 'Пользователь не найден' });
      }
    } catch (error) {
      console.error('Ошибка при получении данных о текущем пользователе:', error);
      res.status(500).json({ message: 'Ошибка при получении данных о текущем пользователе' });
    }
}

);

module.exports = router 

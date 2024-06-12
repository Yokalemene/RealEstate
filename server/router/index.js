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
const Application = require('../models/applications-model');
const Admin = require('../models/admin-model');
const bcrypt = require('bcrypt');
const User = require('../models/user-model');
const ActivityLog = require('../models/ActivityLog');
const Employee = require('../models/employee-model');
const Notification = require('../models/Notification');
const Record = require('../models/records-model');
const Chat = require('../models/chat-model')
const EventEmitter = require('events');
const View = require('../models/view-model');
// const verifyAdmin = require('../middlewares/verify-admin');
const checkToken = require('../middlewares/checkToken');


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
    const { propertyType, location, priceFrom, priceTo, hasReport } = req.query;
    let filter = {};

    if (propertyType) filter.propertyType = propertyType;
    if (location) filter.location = location;
    if (priceFrom) filter.price = { ...filter.price, $gte: priceFrom };
    if (priceTo) filter.price = { ...filter.price, $lte: priceTo };
    if (hasReport === 'true') filter.isApproved = true;

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

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;

    const listings = await Listing.find({ userId: userId, isDeleted: false });

    res.json(listings);
  } catch (error) {
    console.error('Ошибка при получении списка объявлений:', error);
    res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
  }
});

router.patch('/deletelisting/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    }, { new: true }); // { new: true } возвращает обновленный документ

    if (!updatedListing) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    res.json(updatedListing);
  } catch (error) {
    console.error('Ошибка при изменении статуса объявления:', error);
    res.status(500).json({ message: 'Ошибка при изменении статуса объявления' });
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
});

router.post('/createapplication', async (req, res) => {
  try {
    const { listingId } = req.body;

    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Отсутствует заголовок Authorization' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;

    const newApplication = new Application({
      listingId,
      userId
    });

    const savedApplication = await newApplication.save();

    // Создание уведомления с информацией о новой заявке и ее id
    const newNotification = new Notification({
      message: `Новая заявка создана с ID: ${savedApplication._id}`,
      applicationId: savedApplication._id // Сохраняем id заявки в уведомлении
    });

    await newNotification.save();

    res.status(201).json({ message: 'Заявка создана', application: savedApplication });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
});

// // // // // // //АДМИНЫ // // // // // // // // 

// Маршрут для аутентификации администратора
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Получено запрос на вход:', { email, password });

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Администратор не найден с адресом электронной почты:', email);
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    console.log('Администратор найден:', admin);

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.log('Неверный пароль для администратора:', email);
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    console.log('Пароль действителен для администратора:', email);

    // Создание токена
    const token = jwt.sign(
      {
        id: admin._id,
        role: 'admin'
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Токен создан:', token);

    res.json({ token });
  } catch (error) {
    console.error('Ошибка во время входа администратора:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

//Проверка токена администратора
router.get('/admin/verify-admin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Токен доступа отсутствует' });
  }

  try {
    console.log('Проверка токена:', token);
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('Токен успешно декодирован:', decodedToken);

    const admin = await Admin.findById(decodedToken.id);
    if (admin && decodedToken.role === 'admin') {
      console.log('Администратор подтверждён:', admin);
      return res.status(200).json({ isAdmin: true });
    } else {
      console.log('Доступ запрещён: Только для администраторов');
      return res.status(403).json({ message: 'Доступ запрещён: Только для администраторов' });
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return res.status(400).json({ message: 'Неверный токен' });
  }
});


// // Проверка токена администратора
// router.get('/admin/verify-admin', verifyAdmin, async (req, res) => {
//   res.status(200).json({ isAdmin: true });
// });

// Получение всех пользователей
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// Редактирование пользователя
router.put('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при редактировании пользователя' });
  }
});

// Мягкое удаление пользователя
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при мягком удалении пользователя' });
  }
});

// Получение всех объявлений
router.get('/admin/listings',  async (req, res) => {
  try {
    const listings = await Listing.find({ isDeleted: { $ne: true } });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении объявлений' });
  }
});

// Одобрение объявления
router.put('/admin/listings/:id/approve',  async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при одобрении объявления' });
  }
});

// Мягкое удаление объявления
router.delete('/admin/listings/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при мягком удалении объявления' });
  }
});

// Восстановление удаленного объявления
router.put('/admin/listings/restore/:id', (req, res) => {
  // Используем метод findByIdAndUpdate для поиска и обновления документа в MongoDB
  // Передаем идентификатор документа в качестве параметра req.params.id
  // Обновляем поле isDeleted на false, чтобы восстановить объявление
  // Параметр { new: true } указывает вернуть обновленный документ
  Listing.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true })
    .then((listing) => {
      // Если обновление прошло успешно, отправляем обновленное объявление в ответ
      res.json(listing);
    })
    .catch((error) => {
      // Если возникла ошибка, отправляем сообщение об ошибке в ответ
      res.status(400).json('Ошибка: ' + error);
    });
});

// Получение всех заявок с возможностью фильтрации по статусу
router.get('/admin/applications', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const applications = await Application.find(query);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении заявок' });
  }
});

// Одобрение заявки (перевод в статус "В работе")
router.put('/admin/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'В работе', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при одобрении заявки' });
  }
});

// Отмена заявки
router.put('/admin/applications/:id/cancel',  async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'Отклонено', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отмене заявки' });
  }
});

// Завершение заявки
router.put('/admin/applications/:id/complete',  async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'Завершено', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при завершении заявки' });
  }
});


////////////////////////////////////////АДМИНЫ/////////////////////////////////////////////////////////

// Запись действия в журнал
router.post('/activitylog', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;

    const { action, details } = req.body;

    const newLog = new ActivityLog({
      userId,
      action,
      details
    });

    await newLog.save();

    res.status(201).json({ message: 'Действие записано в журнал' });
  } catch (error) {
    console.error('Ошибка при записи действия в журнал:', error);
    res.status(500).json({ message: 'Ошибка при записи действия в журнал' });
  }
});

// Получение всех записей журнала
router.get('/admin/activitylog', async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).populate('userId', 'email');
    res.json(logs);
  } catch (error) {
    console.error('Ошибка при получении записей журнала:', error);
    res.status(500).json({ message: 'Ошибка при получении записей журнала' });
  }
});


router.get('/admin/reports', async (req, res) => {
  try {
    const records = await Record.find();
    res.json(records);
  } catch (error) {
    res.status(500).send('Ошибка при получении отчетов: ' + error.message);
  }
});

router.put('/admin/update-reports/:id', async (req, res) => {
  try {
    const updatedRecord = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).send('Ошибка при обновлении отчета: ' + error.message);
  }
});

router.delete('/admin/delete-reports/:id', async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.status(200).send('Отчет успешно удален');
  } catch (error) {
    res.status(500).send('Ошибка при удалении отчета: ' + error.message);
  }
});


////////////////////////////////////СОТРУДНИКИ////////////////////////////////////////////////////////////
// Принять заявку и перевести в состояние "В работе"
router.post('/employee/application/:id/process', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).send({ error: 'Заявка не найдена' });
    }
    application.status = 'В работе';
    await application.save();

    // Emit event to notify about the update
    req.io.emit('applicationUpdated', application);

    res.send(application);
  } catch (error) {
    res.status(500).send({ error: 'Ошибка сервера' });
  }
});

// Формирование отчета и завершение заявки
router.post('/employee/application/:id/complete', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).send({ error: 'Заявка не найдена' });
    }
    // Логика формирования отчета
    application.status = 'Завершено';
    application.reviewedAt = Date.now();
    await application.save();

    // Emit event to notify about the update
    req.io.emit('applicationUpdated', application);

    res.send(application);
  } catch (error) {
    res.status(500).send({ error: 'Ошибка сервера' });
  }
});

// Отмена заявки
router.post('/employee/application/:id/cancel', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).send({ error: 'Заявка не найдена' });
    }
    application.status = 'Отклонено';
    await application.save();

    // Emit event to notify about the update
    req.io.emit('applicationUpdated', application);

    res.send(application);
  } catch (error) {
    res.status(500).send({ error: 'Ошибка сервера' });
  }
});

// Вход сотрудника
router.post('/employee/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    // Создание токена
    const token = jwt.sign(
      {
        id: employee._id,
        role: 'employee'
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Верификация сотрудника
router.get('/employee/verify-employee', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Токен доступа отсутствует' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const employee = await Employee.findById(decodedToken.id);
    if (employee && decodedToken.role === 'employee') {
      return res.status(200).json({ isEmployee: true });
    } else {
      return res.status(403).json({ message: 'Доступ запрещён: Только для сотрудников' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Неверный токен' });
  }
});

// Получение всех заявок
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().populate('listingId userId');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении заявок' });
  }
});

// Обновление статуса заявки
router.put('/applications/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const application = await Application.findByIdAndUpdate(req.params.id, { status, reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
});

// Получение всех уведомлений
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    if (notifications.length === 0) {
      return res.json({ message: 'Нет новых уведомлений' });
    }
    res.json(notifications);
  } catch (error) {
    console.error('Ошибка при получении уведомлений:', error.message); // Выводим ошибку в консоль для отладки
    res.status(500).json({ error: 'Ошибка при получении уведомлений. Пожалуйста, попробуйте снова позже.' });
  }
});


const eventEmitter = new EventEmitter();
// Маркировка уведомления как прочитанного
router.post('/employee/notifications/:id/markAsRead', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).send({ error: 'Уведомление не найдено' });
    }
    notification.isRead = true;
    await notification.save();

    // Генерируем событие 'notificationUpdated' с передачей уведомления в обработчики
    eventEmitter.emit('notificationUpdated', notification);

    res.send(notification);
  } catch (error) {
    res.status(500).send({ error: 'Ошибка сервера' });
  }
});

router.get('/employee/applications/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    res.json(application);
  } catch (error) {
    console.error('Ошибка при получении заявки:', error);
    res.status(500).json({ message: 'Ошибка при получении заявки' });
  }
});

router.put('/employee/applications/:id/update-status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Статус заявки обновлен', application });
  } catch (error) {
    console.error('Ошибка при обновлении статуса заявки:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса заявки' });
  }
});

// Роутинг для создания отчета по заявкеrouter.post('/applications/:id/create-report', async (req, res) => {
router.post('/employee/applications/:id/create-report', async (req, res) => {
  try {
    const { clientName, propertyType, location, price, bedrooms, bathrooms, area, description, rating } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const newRecord = new Record({
      applicationId: req.params.id,
      clientName,
      propertyType,
      location,
      price,
      bedrooms,
      bathrooms,
      area,
      description,
      rating
    });

    await newRecord.save();

    // Обновить статус заявки на "Завершено"
    application.status = 'Завершено';
    await application.save();

    res.status(201).json({ message: 'Отчет создан', report: newRecord });
  } catch (error) {
    console.error('Ошибка при создании отчета:', error);
    res.status(500).json({ message: 'Ошибка при создании отчета' });
  }
});

  // Получить все отчеты по applicationId
router.get('/employee/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const reports = await Record.find({ applicationId });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Ошибка при получении отчетов:', error);
    res.status(500).json({ message: 'Ошибка при получении отчетов' });
  }
});

// Удалить отчет по reportId
router.delete('/employee/delete-report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    await Record.findByIdAndDelete(reportId);
    res.status(200).json({ message: 'Отчет успешно удален!' });
  } catch (error) {
    console.error('Ошибка при удалении отчета:', error);
    res.status(500).json({ message: 'Ошибка при удалении отчета' });
  }
});


router.get('/reports/:listingId', async (req, res) => {
  try {
    const applications = await Application.find({ listingId: req.params.listingId });
    const applicationIds = applications.map(app => app._id); // Получаем массив идентификаторов заявок
    
    const records = await Record.find({ applicationId: { $in: applicationIds } }); // Используем массив идентификаторов для поиска соответствующих записей
    res.json(records);
  } catch (error) {
    res.status(500).send('Ошибка при получении отчетов: ' + error.message);
  }
});


////////////////////////ЛАЙКНУТЫЕ ВКЛАДКИ///////////////////////////////////
//Отображение понравившихся объявлений
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).send('Ошибка при получении понравившихся объявлений: ' + error.message);
  }
});

router.post('/listings/:id/like', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;
    // console.log("Token:", token);
    // console.log("DecodedToken:", decodedToken);
    // console.log("UserId из JWT:", userId); 

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      console.log("Пользователь не найден в базе данных"); 
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    console.log("Пользователь из базы данных:", user); 

    const index = user.favorites.indexOf(listing._id);
    if (index === -1) {
      user.favorites.push(listing._id);
    } else {
      user.favorites.splice(index, 1);
    }
    await user.save();

    // Обновляем состояние лайка для отправки на клиент
    listing.liked = (index === -1);
    await listing.save();

    res.json({ liked: listing.liked });
  } catch (error) {
    console.error('Ошибка при обработке запроса на добавление в избранное:', error);
    res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
  }
});

router.get('/listings/:id/liked', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const userId = decodedToken.id;
  const listingId = req.params.id;
  
  try {
    const user = await User.findById(userId);
    const isLiked = user.favorites.includes(listingId);
    res.json({ liked: isLiked });
  } catch (error) {
    console.error('Ошибка при проверке лайка:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


/////////////////////////////ЧАТ///////////////////////////////////////////
// Получить все чаты для сотрудника
router.get('/employee/chats', async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
});

//Получить все чаты, созданные пользователем
router.get('/chats', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;
    
    const user = await UserModel.findById(userId); 
    
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    const chats = await Chat.find({ userId: userId});
    res.json(chats);
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
});

//Отправить сообщение в чате
router.post('/chats/:chatId/messages', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;
    
    const user = await UserModel.findById(userId); 
    
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    // const username = await UserModel.findById(userId).select('firstName');

    // if (!username) {
    //     return res.status(404).json({ message: 'Пользователь не найден' });
    // }
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    const message = {
      sender: `Клиент`,
      message: req.body.message
    };
    chat.messages.push(message);
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});


//Создать новый чат
router.post('/create-chat', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;
    
    const user = await UserModel.findById(userId); 

    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }


    const chat = new Chat({
        userId: userId,
    });
    
    await chat.save();

    const savedChat = await chat.save();

    const newNotification = new Notification({
      message: `Новый чат создан - ID: ${savedChat._id}`,
      chatId: savedChat._id // Сохраняем id заявки в уведомлении
    });

    await newNotification.save();
    
    res.json(chat);
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
});

//Отображение чата сотруднику
router.get('/employee/chats/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Сортировка сообщений по времени
    res.json(chat);
  } catch (error) {
    console.error('Ошибка при получении чата:', error);
    res.status(500).json({ error: 'Ошибка при получении чата' });
  }
});
//Сообщение сотрудника в чат
router.post('/employee/chats/:chatId/messages', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decodedToken.id;
    
    const employee = await Employee.findById(userId); 
    if (!employee) {
        return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    // const username = await Employee.findById(userId).select('username');
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    const message = {
      sender: `Сотрудник`,
      message: req.body.message
    };
    chat.messages.push(message);
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

//Завершение чата
router.post('/employee/chats/:chatId/complete', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    const completeChat = await Chat.findByIdAndUpdate(req.params.chatId, {
      status:'Завершенный'
    });

    await completeChat.save();
    res.json(completeChat);
  } catch (error) {
    console.error('Ошибка при завершении чата:', error);
    res.status(500).json({ error: 'Ошибка при завершении чата' });
  
}
});

//Получение имени клиента
router.get('/employee/users/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const employeeId = decodedToken.id;
    
    const employee = await Employee.findById(employeeId); 
    if (!employee) {
        return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    if(employee)
    {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } 
  }
  catch (error) {
    console.error('Ошибка при получении имени клиента:', error);
    res.status(500).json({ error: 'Ошибка при получении имени клиента' });
  }
  
});


////////////////////Создание аккаунтов сотрудников админом////////////
// Получение всех админов
router.get('/admin/admins', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Получение всех администраторов и сотрудников
router.get('/admin/employees', async (req, res) => {
  try {
    const admins = await Admin.find({});
    const employees = await Employee.find({});
    
    const adminData = admins.map(admin => ({ ...admin._doc, role: 'Админ' }));
    const employeeData = employees.map(employee => ({ ...employee._doc, role: 'Сотрудник' }));
    
    const allEmployees = [...adminData, ...employeeData];

    res.json(allEmployees);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при загрузке данных' });
  }
}); 

// Создание нового администратора или сотрудника
router.post('/admin/employees', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let newUser;
    if (role === 'Админ') {
      newUser = new Admin({ username, email, password });
    } else {
      newUser = new Employee({ username, email, password });
    }
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

// Удаление сотрудника или администратора
router.delete('/admin/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      const admin = await Admin.findByIdAndDelete(id);
      if (!admin) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
    }
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

// Обновление сотрудника или администратора
router.put('/admin/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    let updatedUser;
    if (role === 'Админ') {
      updatedUser = await Admin.findByIdAndUpdate(id, { username, email }, { new: true });
    } else {
      updatedUser = await Employee.findByIdAndUpdate(id, { username, email }, { new: true });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

//////////////////////////////ОБЪЯВЛЕНИЯ//////////////////////////////////////////////////
// Проверка созданных заявок у объявления
router.get('/checkapplication/:listingId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Необходимо авторизоваться' });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Необходимо авторизоваться' });
    }
    const userId = decoded.id;
    const { listingId } = req.params;

    const existingApplication = await Application.findOne({
      listingId,
      userId,
      status: { $in: ['Ожидает обработки', 'В работе'] }
    });

    if (existingApplication) {
      return res.status(200).json({ exists: true });
    }
    else{
    res.status(200).json({ exists: false });
    }
    } catch (error) {
      console.error('Ошибка проверки заявок:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавление просмотра
router.post('/views/:listingId/log', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Необходимо авторизоваться' });
  }
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  if (!decoded) {
    return res.status(401).json({ error: 'Необходимо авторизоваться' });
  }
  const userId = decoded.id;
  const { listingId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existingView = await View.findOne({ listingId, userId, timestamp: { $gte: today } });

    if (existingView) {
      return res.status(200).send({ message: 'Просмотр уже зачтён' });
    }

    const view = new View({ listingId, userId });
    await view.save();
    res.status(201).send(view);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Получение информации о просмотрах
router.get('/views/:listingId/check', async (req, res) => {
  const { listingId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const totalViews = await View.countDocuments({ listingId });
    const todayViews = await View.countDocuments({ listingId, timestamp: { $gte: today } });
    res.status(200).send({ totalViews, todayViews });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Активация аккаунта
router.get('/activate/:link', userController.activate);

// Восстановление пароля
router.post('/forgot-password', userController.forgotPassword);

// Сброс пароля
router.post('/reset-password/:token', userController.resetPassword);

//Изменение пароля
router.patch('/change-password', async (req, res) => {
  try  {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Необходимо авторизоваться' });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Необходимо авторизоваться' });
    }
    const userId = decoded.id;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

// module.exports = {
//   router,
//   eventEmitter
// };

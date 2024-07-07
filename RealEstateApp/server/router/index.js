require('dotenv').config()
const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const path = require('path');
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
const Employee = require('../models/employee-model');
const Notification = require('../models/Notification');
const Record = require('../models/records-model');
const Chat = require('../models/chat-model')
const EventEmitter = require('events');
const View = require('../models/view-model');
// const verifyAdmin = require('../middlewares/verify-admin');
const checkToken = require('../middlewares/checkToken');
const adminController = require('../controllers/admin-controller');
const EmployeeController = require('../controllers/employee-contoller');

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

router.get('/verify-role', async (req, res) => {
  try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      const user = await User.findById(decodedToken.id);

      if (!user) {
          return res.status(404).json({ message: 'Пользователь не найден' });
      }

      return res.status(200).json({ role: user.role });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

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
router.get('/listings', userController.getAllListings);

// Добавление нового объявления
router.post('/listings', upload.array('photos', 5), userController.createListing);

router.get('/listings/unique-locations', userController.getAllCities);

router.get('/listings/:id', userController.getLisitingDetails);

router.get('/mylistings', userController.getMyListings);

router.patch('/deletelisting/:id',userController.deleteListing);

router.get('/getuserphone', userController.getUserPhone);


router.post('/createapplication', userController.createApplication);

// // // // // // //АДМИНЫ // // // // // // // // 

// Получение всех пользователей
router.get('/admin/users', adminController.getAllUsers);

// Получение всех сотрудников
router.get('/admin/employees', adminController.getAllEmployees);

// Создание нового администратора или сотрудника
router.post('/admin/users', adminController.createEmployee);

// Редактирование пользователя
router.put('/admin/users/:id', adminController.editUser);

// Удаление пользователя
router.delete('/admin/users/:id', adminController.deleteUser);

// Получение всех объявлений
router.get('/admin/listings', adminController.getAllListings);  

// Одобрение объявления
router.put('/admin/listings/:id/approve',  adminController.approveListing); //вырезанный функционал

// Мягкое удаление объявления
router.delete('/admin/listings/delete/:id', adminController.deleteListing);

// Восстановление удаленного объявления
router.put('/admin/listings/restore/:id', adminController.restoreListing);

// Получение всех заявок с возможностью фильтрации по статусу
router.get('/admin/applications', adminController.getAllAplications);

// Одобрение заявки (перевод в статус "В работе")
router.put('/admin/applications/:id/approve', adminController.setApplicationInWork);

// Отмена заявки
router.put('/admin/applications/:id/cancel', adminController.cancelApplication);

// Завершение заявки
router.put('/admin/applications/:id/complete',  adminController.completeApplication);


////////////////////////////////////////АДМИНЫ/////////////////////////////////////////////////////////

// Запись действия в журнал
router.post('/activitylog', authMiddleware, userController.logActivity);

// Получение всех записей журнала
router.get('/admin/activitylog', adminController.showAllActivities);


router.put('/admin/update-reports/:id', adminController.updateReports);

router.delete('/admin/delete-reports/:id', adminController.deleteReports);


////////////////////////////////////СОТРУДНИКИ////////////////////////////////////////////////////////////
// Принять заявку и перевести в состояние "В работе"
router.post('/employee/application/:id/process', EmployeeController.SetApplicationInWork);

// Формирование отчета и завершение заявки
router.post('/employee/application/:id/complete', EmployeeController.CompleteApplication);

// Отмена заявки
router.post('/employee/application/:id/cancel', EmployeeController.CancelApplication);

// Верификация сотрудника
router.get('/employee/verify-employee', EmployeeController.verifyEmployee);

// Получение всех заявок
router.get('/applications', EmployeeController.getAllApplications);

// Обновление статуса заявки
router.put('/applications/:id', EmployeeController.UpdateApplicationStatus);

// Получение всех уведомлений
router.get('/notifications', EmployeeController.getNotifications);


const eventEmitter = new EventEmitter();
// Маркировка уведомления как прочитанного
router.post('/employee/notifications/:id/markAsRead', EmployeeController.markNotificationAsRead);

router.get('/employee/applications/:id', EmployeeController.getApplicationsById);

router.put('/employee/applications/:id/update-status', EmployeeController.updateApplicationsStatus);

// Получение информации обо всех отчетах
router.get('/admin/reports', EmployeeController.getReports);

// Роутинг для создания отчета по заявке
router.post('/employee/applications/:id/create-report', EmployeeController.createReport);

  // Получить все отчеты по applicationId
router.get('/employee/application/:applicationId', EmployeeController.getAllReportsByAppId);

// Удалить отчет по reportId
router.delete('/employee/delete-report/:reportId', EmployeeController.deleteReportById);

router.get('/reports/:listingId', EmployeeController.getListingInfoById);


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
    
    const user = await UserModel.findById(userId); 
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (user.role !== 'Сотрудник') {
        return res.status(403).json({ message: 'Доступ запрещен' });
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
    const userId = decodedToken.id;
    
    const user = await UserModel.findById(userId); 
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (user.role !== 'Сотрудник') {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }
    
    const client = await UserModel.findById(req.params.userId);
    if (!client) {
        return res.status(404).json({ message: 'Клиент не найден' });
    }
    res.json(client);
  } catch (error) {
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
    // Найти всех пользователей с ролями 'Администратор' и 'Сотрудник'
    const users = await User.find({
      role: { $in: ['Администратор', 'Сотрудник'] }
    });

    // Форматировать данные
    const userData = users.map(user => ({
      ...user._doc,
      role: user.role === 'Администратор' ? 'Админ' : 'Сотрудник'
    }));

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при загрузке данных' });
  }
});

// Создание нового администратора или сотрудника
router.post('/admin/employees', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!['Администратор', 'Сотрудник'].includes(role)) {
    return res.status(400).json({ error: 'Неверная роль пользователя' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
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
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
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

  if (!['Администратор', 'Сотрудник'].includes(role)) {
    return res.status(400).json({ error: 'Неверная роль пользователя' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { username, email, role }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
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

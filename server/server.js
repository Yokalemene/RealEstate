require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const router  = require('./router/index');
const adminRoutes = require('./router/admin');
const path = require('path');
const http = require('http');
// const chatRoutes = require('./router/chat-routes');
const socketIo = require('socket.io');
const reportRoutes = require('./router/reportRoutes');
//const errorMiddleware = require('./middlewares/error-middleware');
// const checkToken = require('./middlewares/checkToken');


const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    process.env.CLIENT_URL 
  ];
  
app.use(cors({
credentials: true,
origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    callback(null, true);
    } else {
    callback(new Error('Not allowed by CORS'));
    }
}
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('./uploads', cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}), express.static('uploads'));
app.use('/api', router);
//app.use(errorMiddleware);
// Обработчик ошибок для ошибок 401 Unauthorized, может быть сделаю
// app.use((err, req, res, next) => {
//     if (err.status === 401) {
//       // Если ошибка 401 Unauthorized, перенаправляем на LoginPage.js
//       return res.redirect('http://localhost:3000/login');
//     }
    
//     // Передаем управление стандартному обработчику ошибок Express
//     next(err);
//   });


// app.use('/admin', adminRoutes);
// const server = http.createServer(app);
// const io = socketIo(server);

// io.on('connection', (socket) => {
//   console.log('Пользователь подключен');
//   socket.on('disconnect', () => {
//     console.log('Пользователь отключился');
//   });
// });
//Это не уже не нужно для изменения количества уведомлений
// eventEmitter.on('notificationUpdated', (notification) => { 
//     io.emit('notificationUpdated', notification);
//   });
  

app.use('/api/reports', reportRoutes);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log(`Сервер запущен, порт: ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start()

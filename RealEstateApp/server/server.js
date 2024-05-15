require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const router = require('./router/index');
const path = require('path');
//const errorMiddleware = require('./middlewares/error-middleware');



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

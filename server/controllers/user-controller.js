const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const mailService = require('../service/mail-service');
const Listing = require('../models/realestate-model');
const jwt = require('jsonwebtoken');

class UserController {
    
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password, phoneNumber, firstName} = req.body;
            const userData = await userService.registration(email, password, phoneNumber, firstName);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            
            
            //Сообщение об успешной регистрации
             const successMessage = 'Регистрация прошла успешно! Пожалуйста, проверьте вашу почту для активации аккаунта.';
            return res.json({ message: successMessage});
            // res.statusMessage(successMessage);
        } catch (e) {
            next(e); 
        }   
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            res.json({ message: 'Успешный вход', accessToken: userData.accessToken, user: userData.user });
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }   

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await userService.forgotPassword(email);
            return res.json({ message: 'Ссылка для сброса пароля отправлена на вашу почту' });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.json({ message: 'Пароль успешно сброшен' });
        } catch (e) {
            next(e);
        }
    }

    // Получение списка объявлений
    async getAllListings(req, res, next)  {
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
      next(e)
    }
    }
    async createListing(req, res, next) {
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
  }
  
  async getAllCities(req, res, next) {
    try {
      // Используйте агрегацию для получения уникальных местоположений
      const uniqueLocations = await Listing.distinct('location');
      res.json(uniqueLocations);
    } catch (error) {
      console.error('Ошибка при получении уникальных местоположений:', error);
      res.status(500).json({ message: 'Ошибка при получении уникальных местоположений' });
    }
  }
  
  async getLisitingDetails(req, res, next) {
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
  }

  async getMyListings(req, res, next) {
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
  }

  async deleteListing(req, res, next) {
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
    }
 
    async getUserPhone(req, res, next) {
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
  
        async createApplication(req, res, next) {
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
        }
  
        async logActivity(req, res, next) {
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
            }



}


module.exports = new UserController();

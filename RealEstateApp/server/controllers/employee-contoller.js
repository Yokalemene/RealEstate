const Application = require('../models/applications-model');
const EventEmitter = require('events');
const Notification = require('../models/Notification');
const Record = require('../models/records-model');
const Listing = require('../models/realestate-model');

const eventEmitter = new EventEmitter();

const EmployeeController = {

    async SetApplicationInWork(req,res) {
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

    },

    async CompleteApplication(req, res) {
        try {
            const application = await Application.findById(req.params.id);
            if (!application) {
              return res.status(404).send({ error: 'Заявка не найдена' });
            }
            // Логика формирования отчета
            application.status = 'Завершено';
            application.reviewedAt = Date.now();
            await application.save();
            req.io.emit('applicationUpdated', application);
        
            res.send(application);
          } catch (error) {
            res.status(500).send({ error: 'Ошибка сервера' });
          }
    },

    async CancelApplication(req, res) {
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
    },

    async verifyEmployee(req,res) {
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
    },

    async getAllApplications(req, res) {
        try {
            const applications = await Application.find().populate('listingId userId');
            res.json(applications);
          } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении заявок' });
          }
        },

    async UpdateApplicationStatus(req, res) {
        const { status } = req.body;

        try {
          const application = await Application.findByIdAndUpdate(req.params.id, { status, reviewedAt: new Date() }, { new: true });
          res.json(application);
        } catch (error) {
          res.status(500).json({ message: 'Ошибка при обновлении заявки' });
        }
    },

    async getNotifications(req, res) {
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
    },

    async markNotificationAsRead(req, res) {
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
    },

    async getApplicationsById(req, res) {
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
    },

    async updateApplicationsStatus(req, res) {
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
    },
    
    async getReports(req, res) {
        try {
            const records = await Record.find();
            res.json(records);
          } catch (error) {
            res.status(500).send('Ошибка при получении отчетов: ' + error.message);
          }
    },

    async createReport(req, res) {
        try {
            const {
              clientName, propertyType, location, price, bedrooms, bathrooms, area, description, rating,
              yearBuilt, totalArea, livingArea, kitchenArea, balcony, repair, houseType, floorCount,
              floorType, entrances, heating, emergency, gasSupply, ceilingHeight, parking, plotArea,
              landCategory, plotStatus, sewage, electricity
            } = req.body;
        
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
              rating,
              yearBuilt,
              totalArea,
              livingArea,
              kitchenArea,
              balcony,
              repair,
              houseType,
              floorCount,
              floorType,
              entrances,
              heating,
              emergency,
              gasSupply,
              ceilingHeight,
              parking,
              plotArea,
              landCategory,
              plotStatus,
              sewage,
              electricity
            });
        
            await newRecord.save();
        
            application.status = 'Завершено';
            await application.save();
        
            const listing = await Listing.findById(application.listingId);
        
            if (!listing) {
              return res.status(404).json({ message: 'Объявление не найдено' });
            }
        
            listing.isApproved = true;
            await listing.save();
        
            res.status(201).json({ message: 'Отчет создан', report: newRecord });
          } catch (error) {
            console.error('Ошибка при создании отчета:', error);
            res.status(500).json({ message: 'Ошибка при создании отчета' });
          }
    },

    async getAllReportsByAppId(req, res) {
        try {
            const { applicationId } = req.params;
            const reports = await Record.find({ applicationId });
        
            if (reports.length === 0) {
              return res.status(404).json({ message: 'Отчеты не найдены' });
            }
        
            res.status(200).json(reports);
          } catch (error) {
            console.error('Ошибка при получении отчетов:', error);
            res.status(500).json({ message: 'Ошибка при получении отчетов' });
          }
    },

    async deleteReportById(req, res) {
        try {
            const { reportId } = req.params;
            await Record.findByIdAndDelete(reportId);
            res.status(200).json({ message: 'Отчет успешно удален!' });
          } catch (error) {
            console.error('Ошибка при удалении отчета:', error);
            res.status(500).json({ message: 'Ошибка при удалении отчета' });
          }
    },

    async getListingInfoById(req, res) {
        try {
            const applications = await Application.find({ listingId: req.params.listingId });
            const applicationIds = applications.map(app => app._id); // Получаем массив идентификаторов заявок
            
            const records = await Record.find({ applicationId: { $in: applicationIds } }); // Используем массив идентификаторов для поиска соответствующих записей
            res.json(records);
          } catch (error) {
            res.status(500).send('Ошибка при получении отчетов: ' + error.message);
          }
    },

    
}

module.exports = EmployeeController;

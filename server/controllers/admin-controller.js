const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const ActivityLog = require('../models/ActivityLog');
const Listing = require('../models/realestate-model');
const Application = require('../models/applications-model');

const adminController = {
 
  async getAllUsers(req, res) {
    try {
      const users = await User.find({ isDeleted: { $ne: true }, role: 'Пользователь' });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
  },

  async getAllEmployees(req, res) {
    try {
      const employees = await User.find({ isDeleted: { $ne: true }, role: { $in: ['Администратор', 'Сотрудник'] } });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при получении сотрудников' });
    }
  },

  async createEmployee(req, res) {
    const { email, password, phoneNumber, firstName, middleName, lastName, role } = req.body;
    const isActivated = true;
    if (![ 'Администратор', 'Сотрудник'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль пользователя' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword, phoneNumber, firstName, middleName, lastName, role, isActivated });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
  }, 

  async editUser(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const user = await User.findByIdAndUpdate(id, updatedData, { new: true });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при редактировании пользователя' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при мягком удалении пользователя' });
    }
  },  

  async getAllListings(req, res) {
    try {
      const listings = await Listing.find({ isDeleted: { $ne: true } });
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при получении объявлений' });
    }
  },

  async approveListing(req,res) {
    try {
      const { id } = req.params;
      const listing = await Listing.findByIdAndUpdate(id, { isApproved: true }, { new: true });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при одобрении объявления' });
    }
  },

async deleteListing(req,res) {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при мягком удалении объявления' });
  }
},

async restoreListing(req, res) {
  Listing.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true })
  .then((listing) => {
    // Если обновление прошло успешно, отправляем обновленное объявление в ответ
    res.json(listing);
  })
  .catch((error) => {
    // Если возникла ошибка, отправляем сообщение об ошибке в ответ
    res.status(400).json('Ошибка: ' + error);
  })
},

async getAllAplications(req, res) {
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
},

async setApplicationInWork(req, res) {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'В работе', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при одобрении заявки' });
  }
},

async cancelApplication(req, res) {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'Отклонено', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отмене заявки' });
  }


},

async completeApplication(res, req) {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { status: 'Завершено', reviewedAt: new Date() }, { new: true });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при завершении заявки' });
  }
},

async showAllActivities(req, res) {
  try {
    const logs = await ActivityLog.find({}).populate('userId', 'email');
    res.json(logs);
  } catch (error) {
    console.error('Ошибка при получении записей журнала:', error);
    res.status(500).json({ message: 'Ошибка при получении записей журнала' });
  }
},

async updateReports(req, res) {
  try {
    const updatedRecord = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).send('Ошибка при обновлении отчета: ' + error.message);
  }
},


}

module.exports = adminController;

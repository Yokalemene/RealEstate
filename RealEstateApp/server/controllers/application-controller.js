const Application = require('../models/applications-model');

const applicationController = {
  getApplications: async (req, res) => {
    try {
      const applications = await Application.find();
      res.json(applications);
    } catch (error) {
      console.error('Ошибка при получении запросов на одобрение объявлений:', error);
      res.status(500).json({ message: 'Ошибка при получении запросов на одобрение объявлений' });
    }
  },
    // Другие методы для управления запросами на одобрение объявлений
};

module.exports = applicationController;

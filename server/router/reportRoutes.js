
const express = require('express');
const router = express.Router();
const Report = require('../models/records-model');

// Получить все отчеты
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error('Ошибка при получении отчетов:', error);
    res.status(500).json({ message: 'Ошибка при получении отчетов' });
  }
});

// Получить отчет по ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Отчет не найден' });
    }
    res.json(report);
  } catch (error) {
    console.error('Ошибка при получении отчета:', error);
    res.status(500).json({ message: 'Ошибка при получении отчета' });
  }
});

// Создать новый отчет
router.post('/', async (req, res) => {
  try {
    const { title, description, propertyId, evaluation } = req.body;
    const newReport = new Report({ title, description, propertyId, evaluation });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Ошибка при создании отчета:', error);
    res.status(500).json({ message: 'Ошибка при создании отчета' });
  }
});

module.exports = router;
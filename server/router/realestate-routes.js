// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const uploadPath = path.join(__dirname, '../uploads');
// const RealEstate = require('../models/realestate-model');
// const jwt = require('jsonwebtoken');
// const Application = require('../models/applications-model');
// const authMiddleware = require('../middlewares/auth-middleware');

// // Загрузка фотографий в хранилище на сервере
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage });

// router.get('/listings', async (req, res) => {
//   try {
//     const { propertyType, location, priceFrom, priceTo } = req.query;
//     let filter = {};

//     if (propertyType) filter.propertyType = propertyType;
//     if (location) filter.location = location;
//     if (priceFrom) filter.price = { ...filter.price, $gte: priceFrom };
//     if (priceTo) filter.price = { ...filter.price, $lte: priceTo };

//     const listings = await RealEstate.find(filter);
//     res.json(listings);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
//   }
// });

// router.post('/listings', authMiddleware, upload.array('photos', 5), async (req, res) => {
//   try {
//     const { propertyType, location, price, description, contactInfo } = req.body;
//     const photos = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const userId = decodedToken.id;

//     const newListing = new RealEstate({
//       userId,
//       propertyType,
//       location,
//       price,
//       description,
//       contactInfo,
//       photos
//     });
//     await newListing.save();
//     res.status(201).json({ message: 'Объявление успешно добавлено' });
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при добавлении объявления' });
//   }
// });

// router.get('/listings/unique-locations', async (req, res) => {
//   try {
//     const uniqueLocations = await RealEstate.distinct('location');
//     res.json(uniqueLocations);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении уникальных местоположений' });
//   }
// });

// router.get('/listings/:id', async (req, res) => {
//   try {
//     const listing = await RealEstate.findById(req.params.id);
//     if (!listing) {
//       return res.status(404).json({ message: 'Объявление не найдено' });
//     }
//     res.json(listing);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении объявления' });
//   }
// });

// router.get('/mylistings', authMiddleware, async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const userId = decodedToken.id;
//     const listings = await RealEstate.find({ userId: userId, isDeleted: false });
//     res.json(listings);
//   } catch (error) {
//     res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
//   }
// });


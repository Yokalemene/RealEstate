// const Listing = require('../models/realestate-model');

// class ListingService {
//     router.get('/listings', async (req, res) => {
//         try {
//             const listings = await Listing.find();
//             res.json(listings);
//         } catch (error) {
//             console.error('Ошибка при получении списка объявлений:', error);
//             res.status(500).json({ message: 'Ошибка при получении списка объявлений' });
//         }
//     });
    
//     // Добавление нового объявления
//     router.post('/listing', async (req, res) => {
//         try {
//             const newListing = await Listing.create(req.body);
//             res.json(newListing);
//         } catch (error) {
//             console.error('Ошибка при добавлении объявления:', error);
//             res.status(500).json({ message: 'Ошибка при добавлении объявления' });
//         }
//     });
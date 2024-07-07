const Listing = require('../models/realestate-model');

const listingController = {
  getAllListings: async (req, res) => {
    try {
      const listings = await Listing.find();
      res.json(listings);
    } catch (error) {
      console.error('Ошибка при получении объявлений:', error);
      res.status(500).json({ message: 'Ошибка при получении объявлений' });
    }
  },
  // Другие методы для управления объявлениями
};

module.exports = listingController;

const multer = require('multer'); // Для обработки загружаемых файлов

// Настройка multer для сохранения загруженных фотографий
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Папка, куда будут сохранены загруженные файлы
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Имя файла будет уникальным
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
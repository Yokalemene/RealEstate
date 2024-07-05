// const jwt = require('jsonwebtoken');
// const Admin = require('../models/admin-model');

// const verifyAdmin = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Токен доступа отсутствует' });
//   }

//   try {
//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     const admin = await Admin.findById(decodedToken.id);
//     if (admin && decodedToken.role === 'admin') {
//       req.user = admin;
//       next();
//     } else {
//       return res.status(403).json({ message: 'Доступ запрещён: Только для администраторов' });
//     }
//   } catch (error) {
//     return res.status(400).json({ message: 'Неверный токен' });
//   }
// };

// module.exports = verifyAdmin;
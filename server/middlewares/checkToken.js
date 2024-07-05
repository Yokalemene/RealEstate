const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ error: 'Токен просрочен' });
      }
      return res.status(401).send({ error: 'Невалидный токен' });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = checkToken;
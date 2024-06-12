const jwt = require('jsonwebtoken');
const ApiError = require('../exceptions/api-error');

module.exports = function(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return next(ApiError.UnauthorizedError('Токен отсутствует'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return next(ApiError.UnauthorizedError('Доступ запрещен'));
        }
        req.adminId = decoded.id;
        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError('Неверный токен'));
    }
};


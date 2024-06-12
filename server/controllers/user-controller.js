const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const mailService = require('../service/mail-service');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

class UserController {
    
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password, phoneNumber, firstName} = req.body;
            const userData = await userService.registration(email, password, phoneNumber, firstName);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            
            
            //Сообщение об успешной регистрации
             const successMessage = 'Регистрация прошла успешно! Пожалуйста, проверьте вашу почту для активации аккаунта.';
            return res.json({ message: successMessage});
            // ,res.statusMessage(successMessage);
        } catch (e) {
            next(e); 
        } 
          
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            res.json({ message: 'Успешный вход', accessToken: userData.accessToken, user: userData.user, role: userData.user.role });
        } catch (e) {
            next(e);
        }
    }

    async verifyRole(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Токен доступа отсутствует' });
            }
            const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await userModel.findById(decodedToken.id);
    
            if (user && decodedToken.role === user.role) {
                return res.status(200).json({ isVerified: true, role: user.role });
            } else {
                return res.status(403).json({ message: 'Доступ запрещён: Некорректная роль' });
            }
        } catch (error) {
            console.error('Ошибка при проверке токена:', error);
            return res.status(400).json({ message: 'Неверный токен' });
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

   async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await userService.forgotPassword(email);
            return res.json({ message: 'Ссылка для сброса пароля отправлена на вашу почту' });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.json({ message: 'Пароль успешно сброшен' });
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();

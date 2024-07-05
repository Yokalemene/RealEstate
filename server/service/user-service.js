const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

class UserService {
    async registration(email, password, phoneNumber, firstName) {
        const checkemail = await userModel.findOne({ email });
        const checkphone = await userModel.findOne({ phoneNumber });
        if (checkemail) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
        if (checkphone) {
            throw ApiError.BadRequest(`Пользователь с номером телефона ${phoneNumber} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // Generate activation link

        const user = await userModel.create({
            email,
            password: hashPassword,
            phoneNumber,
            firstName,
            activationLink
        });

        const newActivityLog = new ActivityLog({
            userId: user._id,
            action: 'Регистрация аккаунта',
            details: { email: user.email },
        });
        await newActivityLog.save();

        // Send activation email
        const activationUrl = `${process.env.API_URL}/api/activate/${activationLink}`;
        await mailService.sendActivationMail(email, activationUrl);

        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto };
    }

    async login(email, password) {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        if (!user.isActivated) {
            throw ApiError.BadRequest('Аккаунт не активирован');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await userModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Неверная ссылка активации');
        }
        user.isActivated = true;
        user.activationLink = null;
        await user.save();
    }

    async generateActivationLink(email) {
        const activationLink = crypto.randomBytes(32).toString('hex');
        await userModel.updateOne({ email }, { activationLink });
        return activationLink;
    }

    async forgotPassword(email) {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const resetToken = uuid.v4();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await mailService.sendPasswordResetMail(email, resetUrl);
    }

    async resetPassword(token, newPassword) {
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            throw ApiError.BadRequest('Ссылка для сброса пароля недействительна или истекла');
        }
        const hashPassword = await bcrypt.hash(newPassword, 3);
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    }

}

module.exports = new UserService();

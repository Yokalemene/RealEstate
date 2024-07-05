const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: ['Пользователь', 'Администратор', 'Сотрудник'], required: true, default: 'Пользователь' }
});

module.exports = model('User', UserSchema);

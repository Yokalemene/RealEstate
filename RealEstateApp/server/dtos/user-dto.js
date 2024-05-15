module.exports = class UserDto {
    email;
    id;
    phoneNumber;
    firstName;
    middleName;
    lastName;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.phoneNumber = model.phoneNumber;
        this.firstName = model.firstName;
        this.middleName = model.middleName || ''; // Обрабатываем случай, если отчество не указано
        this.lastName = model.lastName || ''; // Обрабатываем случай, если фамилия не указана
    }
};
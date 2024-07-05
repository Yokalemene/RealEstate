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
        this.middleName = model.middleName || '';
        this.lastName = model.lastName || ''; 
    }
};
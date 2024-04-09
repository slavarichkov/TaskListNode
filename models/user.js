const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { // имя пользователя
        type: String, 
        required: false, 
        minlength: 2, 
        maxlength: 50, 
    },
    email: {
        type: String,
        maxlength: 330,
        required: true,
        unique: true,
    },
    login: { // уникальный логин, присваивается автоматически системой при создании пользователя
        type: String,
        unique: true,
        maxlength: 330,
    },
    password: {
        type: String,
        maxlength: 330,
        required: true,
        select: false, 
    },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

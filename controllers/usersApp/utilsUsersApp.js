const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken;
require('dotenv').config(); // подключить ENV, не сам файл, а возможность его чтения

const { NODE_ENV, JWT_SECRET } = process.env;

const userModel = require('../../models/user');

// Импорт классов ошибок
const BAD_REQUEST_M = require('../../utils/responce/BAD_REQUEST');
const CONFLICT_M = require('../../utils/responce/CONFLICT');
const UNAUTHORIZED_M = require('../../utils/responce/UNAUTHORIZED');
const INTERNAL_SERVER_ERROR_M = require('../../utils/responce/INTERNAL_SERVER_ERROR');
const NOT_FOUND_M = require('../../utils/responce/NOT_FOUND');
const UserModel = require('../../models/user');

//registerUser --------------------------------------------
async function hashPassword(password) {

    // Генерируем соль для хеширования пароля
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }
    catch (err) {
        console.log(err);
        throw new INTERNAL_SERVER_ERROR_M('Ошибка при хешировании');
    }
}

async function generateUniqueLogin(email) {

    let login = '';
    login = email.split('@')[0];

    let counter = 0;
    let isUnique = false;

    while (!isUnique) {
        const potentialLogin = counter > 0 ? login + counter : login;

        const findedUser = await userModel.findOne({ login: potentialLogin });

        if (!findedUser) {
            // Если пользователь с таким логином не найден, то он уникальный
            isUnique = true;
            login = potentialLogin;
        } else {
            // Если пользователь с таким логином уже существует, увеличиваем счетчик
            counter++;
        }
    }
    return login;
}

// Сохраняем пользователя в базе данных 
async function createUser(name, email, login, role, hashedPassword) {
    try {
        const newUser = await userModel.create({
            name: name,
            email: email,
            login: login,
            password: hashedPassword, // Сохраняем хешированный пароль в базе данных
            role: role,
        })
        return newUser;
    }
    catch (err) {
        console.error(err);
        if (err.code === 11000) {
            throw new CONFLICT_M('Пользователь с такой почтой уже существует')
        }
        throw new INTERNAL_SERVER_ERROR_M('Ошибка при сохранении пользователя')
    }
}

async function updateUser(dataUser) {

    if (dataUser.login) {
        const findedUserByLogin = await UserModel.findOne({ login: dataUser.login });
        if (findedUserByLogin) {
            throw new CONFLICT_M('Пользователь с таким логином уже существует')
        }
    }

    //Поиск пользователя в БД
    const findedUser = await userModel.findById(dataUser.idUser).select('password email')

    if (!findedUser) {
        throw new CONFLICT_M('Пользователь с такими данными не заведен в базу');
    }

    let update = {};

    // если есть пароль для обновления
    if (dataUser.updatePassword) {

        //Проверить пароль
        const userPassword = findedUser.password;
        if (!dataUser.currentPassword) {
            throw new BAD_REQUEST_M('Не передан текущий пароль')
        }
        const isChekedPassword = await comparePassword(dataUser.currentPassword, userPassword);
        if (!isChekedPassword) {
            setupAuthenticationLock(email) // настройки таймера и счетчика попыток смены пароль
            throw new BAD_REQUEST_M('Неверный пароль');
        }

        //Получить хэш нового пароля
        const hashedUpdatePassword = await hashPassword(dataUser.updatePassword);
        update.password = hashedUpdatePassword;
    }

    // если есть логин
    if (dataUser.login) {
        update.login = dataUser.login;
    }

    await userModel.findByIdAndUpdate(findedUser._id, update);

}

//Получить инфо о пользователе пользователем(для аутентификации)
async function getSelfUser(id) {
    const findedUser = await userModel.findById(id)
    if (!findedUser) {
        throw new NOT_FOUND_M('Пользователь не найден')
    }
    return findedUser;
}

//Создать токен
async function createToken(dataUser, role) {
    try {
        const payload = { role: role, _id: dataUser._id };
        const token = jwt.sign(payload, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '3y' });
        return token;
    }
    catch (err) {
        throw new INTERNAL_SERVER_ERROR_M('Ошибка при создании токена')
    }
}

//signinUserApp -------------------------------------------
const validateLoginAndPasword = async (login, password) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const regexPassword = /^[a-zA-Zа-яА-Я0-9]+$/;
    if (!emailRegex.test(login) || !regexPassword.test(password)) {
        throw new UNAUTHORIZED_M('Проверьте логин или пароль');
    }
};

// Восстановить пароль
async function recoverPassword(password, email) {

    //Поиск пользователя в БД
    const findedUser = await userModel.findOne({ email: email })

    if (!findedUser) {
        throw new CONFLICT_M('Пользователь с такими данными не заведен в базу');
    }

    //Получить хэш нового пароля
    const hashedUpdatePassword = await hashPassword(password);
    await userModel.findByIdAndUpdate(findedUser._id, { password: hashedUpdatePassword });

    return findedUser;
}

const findUserByEmail = async (email) => {

    try {
        const user = await userModel.findOne({ email: email })
        return user;
    }
    catch (err) {
        throw new INTERNAL_SERVER_ERROR_M('Ошибка при поиске пользователя')
    }
};

async function findUserByEmailReturnWithPassword(email) {
    try {
        const user = await userModel.findOne({ email: email }).select('password')
        return user;
    }
    catch (err) {
        throw new INTERNAL_SERVER_ERROR_M('Ошибка при поиске пользователя')
    }
}

async function comparePassword(password, dataUserPassword) {

    const check = await bcrypt.compare(password, dataUserPassword)

    return check;
}




module.exports = {
    //registerUser
    hashPassword, // хэширование пароля
    createUser, // создать пользователя
    updateUser, // редактировать пользователя
    getSelfUser, // Получить инфо о пользователе пользователем(для аутентификации)
    createToken, // создать токен
    //signinUserApp
    validateLoginAndPasword, // валидация логина и пароля
    recoverPassword, // восстановить пароль
    generateUniqueLogin, // генерация рандомного логина
    //counterAttempts, // проверка количество попыток
    findUserByEmail, // найти пользователя по почте
    findUserByEmailReturnWithPassword, // найти по почте и вернуть с паролем
    findUserByLogin, // найти пользователя по логину
    comparePassword, // проверить пароль
}
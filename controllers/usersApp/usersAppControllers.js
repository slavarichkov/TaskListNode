const userModel = require('../../models/user');

// Импорт классов ошибок
const BAD_REQUEST_M = require('../../utils/responce/BAD_REQUEST');
const CONFLICT_M = require('../../utils/responce/CONFLICT');
const INTERNAL_SERVER_ERROR_M = require('../../utils/responce/INTERNAL_SERVER_ERROR');
const NOT_FOUND_M = require('../../utils/responce/NOT_FOUND');

//Функции
const {
    //registerUser,
    hashPassword, // хэширование пароля
    createUser, // создать пользователя
    updateUser, // редактировать пользователя
    getSelfUser, // Получить инфо о пользователе пользователем(для аутентификации)
    createToken, // создать токен
    //signinUserApp
    validateLoginAndPasword, // валидация логина и пароля
    recoverPassword, // восстановить пароль
    generateUniqueLogin, // генерация рандомного логина
    findUserByEmail, // найти пользователя по почте
    findUserByEmailReturnWithPassword, // найти пользователя по почте и вернуть с паролем
    comparePassword, // проверить пароль
} = require('./utilsUsersApp')

// Регистрация пользователя приложения
async function registerUserApp(req, res, next) {
    const {
        password, email, service
    } = req.body;
    const { deviceId } = req.params;

    try {
        const hashedPassword = await hashPassword(password);
        const login = await generateUniqueLogin(email);
        const role = 'appUser';
        const newUser = await createUser(email, login, role, hashedPassword, service, deviceId);
        const token = await createToken(newUser, 'appUser');

        res.status(200).send({ message: 'пользователь создан', token: token, userId: newUser._id });
    }
    catch (err) {
        if (err.code === 11000) { // проверить существует ли пользователь
            console.log(err);
            next(new CONFLICT_M('Пользователь с такими данными уже существует'));
        } else if (err.name === 'ValidationError') { // проверить валидацию отправленных данных
            next(new BAD_REQUEST_M('Переданы некорректные данные'));
        } else { next(err); } // завершить выполнение кода
    }
}

async function updateUserData(req, res, next) {

    const {
        idUser, login, updatePassword, currentPassword
    } = req.body;

    try {

        let dataUser = {
            idUser: idUser,
        };

        if (login) {
            dataUser.login = login
        }
        if (updatePassword) {
            dataUser.updatePassword = updatePassword
        }
        if (currentPassword) {
            dataUser.currentPassword = currentPassword
        }
        await updateUser(dataUser);
        res.status(200).send({ message: 'Данные обновлены' });
    }
    catch (err) {
        next(err);
    }

}

//АВТОРИЗАЦИЯ
const signinUserApp = async (req, res, next) => {
    const { password, email } = req.body; // получим из объекта запроса

    try {
        // Проверка наличия опасных символов в логине и пароле
        await validateLoginAndPasword(email, password)
        // Если повторная авторизация заблокирована (по времени)
        await checkBlockedUntilTimerForAuth(email)
        //Поиск пользователя в БД
        const findedUser = await findUserByEmailReturnWithPassword(email);

        if (!findedUser) {
            setupAuthenticationLock(email) // настройки таймера и счетчика попыток авторизации
            throw new CONFLICT_M('Пользователь с такими данными не заведен в базу');
        }
        //Проверить пароль
        const userPassword = findedUser.password;

        //const callbackErrorPassword = setupAuthenticationLock(email) // настройки таймера и счетчика попыток авторизации
        const isChekedPassword = await comparePassword(password, userPassword);

        if (!isChekedPassword) {
            setupAuthenticationLock(email) // настройки таймера и счетчика попыток авторизации
            throw new BAD_REQUEST_M('Неверные данные для авторизации');
        }
        //Отправить токен
        const token = await createToken(findedUser, 'appUser');

        res.status(200).send({ token: token, idUser: findedUser._id })
    }

    catch (err) {
        next(err)
    }
}

// Проверка логина(есть ли уже в базе)
async function checkLoginToVacation(req, res, next) {
    const { login } = req.params;

    try {

        const findedUser = await findUserByLogin(login);
        if (findedUser) {
            throw new CONFLICT_M('Пользователь с таким логином найден')
        }
        if (!findedUser) {
            res.status(200).send({ message: 'Логин не занят' });
        }
    }
    catch (err) {
        next(err)
    }
}

//Проверка почты(есть ли в базе)
async function checkEmailToVacation(req, res, next) {
    const { email } = req.params;

    try {
        const findedUser = await findUserByEmail(email);

        if (findedUser) {
            res.status(200).send({ message: 'Пользователь с такой почтой существует' });
        }
        if (!findedUser) {
            throw new NOT_FOUND_M('Пользователь с такой почтой не найден');
        }
    }
    catch (err) {
        next(err);
    }
}

// Проверка авторизации 
async function getSelfUsers(req, res, next) {
    const { _id } = req.user;
    try {
        const user = await getSelfUser(_id);
        res.status(200).send({ user: user });
    }
    catch (err) {
        next(err)
    }

}

// Восстановить пароль
async function recoverPasswordUser(req, res, next) {
    try {
        const { password, email } = req.body;

        await checkConfirmVerificationCodeToUserAuth(email); // Проверить отправлялся ли код верификации на почту
        const findedUser = await recoverPassword(password, email); // Восстановить пароль, возвращает пользователя
        const token = await createToken(findedUser);
        res.status(200).send({ token: token, idUser: findedUser._id });
    }
    catch (err) {
        next(err)
    }

}

async function removeProfileByUser(req, res, next) {

    const {
        password,
    } = req.body;
    const { _id } = req.user;

    try {

        const user = await userModel.findById(_id);
        if (!user) {
            throw new BAD_REQUEST_M('Пользователь не найден')
        }
        //Поиск пользователя в БД
        const findedUser = await findUserByEmailReturnWithPassword(user.email);

        //Проверить пароль
        const userPassword = findedUser.password;

        const isChekedPassword = await comparePassword(password, userPassword);

        if (!isChekedPassword) {
            setupAuthenticationLock(email) // настройки таймера и счетчика попыток авторизации
            throw new BAD_REQUEST_M('Неверные данные для авторизации');
        }

        await userModel.findByIdAndDelete(user._id)

        res.status(200).send({ message: 'Успешно' })
    }
    catch (err) {
        next(err);
    }

}

async function logoutUser(req, res, next) {
    const { _id } = req.user;
    const { deviceId } = req.params;

    try {

        // Обновление документа, удаляя значение из массива idDevices
        await userModel.updateOne(
            { _id: _id },
            { $pull: { idDevices: deviceId } }
        );

        res.status(200).send({ message: 'Успешно' })
    }
    catch (err) {
        next(err);
    }

}

module.exports = {
    registerUserApp, // Регистрация пользователя приложения
    updateUserData, // обновить пользователя
    signinUserApp, // Авторизация
    getSelfUsers, // Проверка авторизации (Поиск пользователя в базе, защищен токеном)
    checkEmailToVacation, // Проверить свободна ли почта(во время введения пользователем при регистрации)
    checkLoginToVacation, // Проверить свободен ли логин
    recoverPasswordUser, // восстановить пароль
    removeProfileByUser, // удалить профиль 
    logoutUser, // выйти из аккаунта(удалить id девайса)
}
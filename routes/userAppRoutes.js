const router = require('express').Router(); // создали роутер

// Пользователи
const {
    getSelfUsers, // получить инфо о пользователе
    checkLoginToVacation, // проверить свободный ли логин
    updateUserData, // обновить пользователя
    removeProfileByUser, // удалить профиль 
    logoutUser,
} = require('../controllers/usersApp/usersAppControllers'); // Проверка авторизации (Поиск пользователя в базе, защищен токеном

// Валидация
const {
    getSelfUsersValidation,
    checkLoginToVacationValidation,
    updateUserDataValidation,
    removeProfileByUserValidation,
    logoutUserValidation,
} = require('../utils/validation/validation')

router.get('/get-self-user/:idUser/:deviceId', getSelfUsersValidation, getSelfUsers); // Проверка авторизации (Поиск пользователя в базе, защищен токеном)
router.get('/check-vacation-login/:login/:deviceId', checkLoginToVacationValidation, checkLoginToVacation); // Проверить свободен ли логин
router.patch('/update-user/:deviceId', updateUserDataValidation, updateUserData); // обновить пользователя
router.patch('/logout-user/:deviceId', logoutUserValidation, logoutUser); // юзер вышел из профиля приложения
router.delete('remove-user/:deviceId', removeProfileByUserValidation, removeProfileByUser); // удалить профиль

module.exports = router;
const router = require('express').Router(); // создали роутер

//Контроллеры 
const {
    getTasks,
    createTask,
    updateTask,
    removeTask,
} = require('../controllers/tasks/tasksControllers');
const {
    getSelfUsers,
    checkLoginToVacation,
    updateUserData,
    logoutUser,
    removeProfileByUser
} = require('../controllers/usersApp/usersAppControllers');

// Валидация
const {
    getTasksValidation,
    createTaskValidation,
    updateTaskValidation,
    removeTaskValidation,
    getSelfUsersValidation,
    checkLoginToVacationValidation,
    logoutUserValidation,
    updateUserDataValidation,
    removeProfileByUserValidation
} = require('../utils/validation/validation');

//Роуты
router.get('/get-tasks/:deviceId', getTasksValidation, getTasks);
router.post('/create-task/:deviceId', createTaskValidation, createTask);
router.patch('/update-task/:deviceId', updateTaskValidation, updateTask);
router.delete('/remove-task/:deviceId', removeTaskValidation, removeTask);
router.get('/get-self-user/:idUser', getSelfUsersValidation, getSelfUsers); // Проверка авторизации (Поиск пользователя в базе, защищен токеном)
router.get('/check-vacation-login/:login', checkLoginToVacationValidation, checkLoginToVacation); // Проверить свободен ли логин
router.patch('/update-user', updateUserDataValidation, updateUserData); // обновить пользователя
router.patch('/logout-user', logoutUserValidation, logoutUser); // юзер вышел из профиля приложения
router.delete('remove-user', removeProfileByUserValidation, removeProfileByUser); // удалить профиль

module.exports = router;
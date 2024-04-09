const { celebrate, Joi, Segments } = require('celebrate');// Валидация приходящих на сервер данных

const { regexStroke, regexIdDevice } = require('../regex/regex');

const getTasksValidation = celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    })
});

const createTaskValidation = celebrate({
    [Segments.BODY]: Joi.object({
        name: Joi.string().max(255).required(),
        text: Joi.string().max(1000).required(),
        isImportant: Joi.boolean().required(),
        isDone: Joi.boolean().required(),
        isPrivate: Joi.boolean().required(),
        idDevice: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const updateTaskValidation = celebrate({
    [Segments.BODY]: Joi.object({
        _id: Joi.string().regex(regexStroke).max(255).required(),
        name: Joi.string().max(1000).max(255).optional(),
        text: Joi.string().optional(),
        isImportant: Joi.boolean().optional(),
        isDone: Joi.boolean().optional(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const removeTaskValidation = celebrate({
    [Segments.BODY]: Joi.object({
        _id: Joi.string().regex(regexStroke).max(255).required(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const registerUserValidation = celebrate({
    [Segments.BODY]: Joi.object({
        password: Joi.string().regex(regexStroke).max(55).required(),
        email: Joi.string().email().regex(regexEmail).max(255).required(),
        service: Joi.string().regex(regexStroke).max(255).optional(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const signinUserValidation = celebrate({
    [Segments.BODY]: Joi.object({
        password: Joi.string().regex(regexStroke).max(55).required(),
        email: Joi.string().email().regex(regexEmail).max(255).required(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const removeProfileByUserValidation = celebrate({
    [Segments.BODY]: Joi.object({
        idUser: Joi.string().regex(regexStroke).max(255).required(),
        password: Joi.string().regex(regexStroke).max(55).required(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const passwordEmailBodyValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().regex(regexEmail).max(255).required(),
        password: Joi.string().regex(regexStroke).max(55).required(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const emailParamsValidation = celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        email: Joi.string().email().regex(regexEmail).max(255).required(),
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const getSelfUsersValidation = celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const checkLoginToVacationValidation = celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        login: Joi.string().regex(regexStroke).max(255).required(),
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const updateUserDataValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        login: Joi.string().regex(regexStroke).max(255).optional(),
        updatePassword: Joi.string().regex(regexPassword).max(55).optional(),
        currentPassword: Joi.string().regex(regexPassword).max(55).optional(),
    }),
    [Segments.PARAMS]: Joi.object().keys({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    }),
});

const logoutUserValidation = celebrate({
    [Segments.PARAMS]: Joi.object({
        deviceId: Joi.string().regex(regexIdDevice).max(255).required(),
    })
});

module.exports = {
    getTasksValidation,
    createTaskValidation,
    updateTaskValidation,
    removeTaskValidation,
    registerUserValidation, // Регистрация пользователя приложения
    signinUserValidation, // Авторизация
    removeProfileByUserValidation, // Удалить профиль
    passwordEmailBodyValidation, // Почта и пароль в боди
    emailParamsValidation, // почта в парамс
    // Юзер приложения(клиент)
    getSelfUsersValidation, // Проверка авторизации (Поиск пользователя в базе, защищен токеном)
    checkLoginToVacationValidation, // Проверить свободен ли логин
    logoutUserValidation, // выйти из аккаунта
    updateUserDataValidation,
    removeProfileByUserValidation,
}
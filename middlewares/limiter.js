const rateLimit = require('express-rate-limit');
const { strangeReqLogger, countersLimitLogger } = require('./logger');

const TOO_MANY_REQ_M = require('../utils/responce/TOO_MANY_REQ');
const { checkUUID } = require('../utils/utils');

const requestCountArray = new Map(); // Используем Map для хранения данных

// Функция для создания информации о запросах
const createRequestInfo = (identifier, timer) => {
    return {
        requestCount: 1,
        timer: setTimeout(() => {
            requestCountArray.delete(identifier);
        }, timer),
    };
};

// Мидлвара для лимита запросов
const limiterUUID = async (req, res, next) => {
    // Данные для лимитов
    const pathParts = req.url.split('/');
    let identifierPart = '';
    let identifier = req.headers['x-real-ip'] || req.ip;
    let isUUID = false;
    let counter = 888;
    let timer = 5 * 60 * 1000; // 5 минут

    // Если длина секретной части после слеша больше 0
    if (pathParts.length > 0) {
        identifierPart = pathParts.pop();
        isUUID = await checkUUID(identifierPart);

        if (isUUID) {
            identifier = identifierPart;
        } 
    } else {
        // Запись лога в файл strangeReq.log
        strangeReqLogger.info(`Strange request - URL: ${req.url}, Method: ${req.method}, IP: ${req.headers['x-real-ip']}, Date: ${new Date()}`);
        next(new TOO_MANY_REQ_M('Too Many Requests'));
    }

    // Если нет deviceId
    if (!isUUID ) {
        // Запись лога в файл strangeReq.log
        strangeReqLogger.info(`Strange request - URL: ${req.url}, Method: ${req.method}, IP: ${req.headers['x-real-ip']}, Date: ${new Date()}`);
        counter = 5;
        timer = 15 * 60 * 1000; // 15 минут
    }

    // Если информации о данном идентификаторе еще нет, создаем информацию
    if (!requestCountArray.has(identifier)) {
        requestCountArray.set(identifier, createRequestInfo(identifier, timer));
    } else {
        // Если информация о идентификаторе уже есть, увеличиваем счетчик
        const info = requestCountArray.get(identifier);
        info.requestCount += 1;
    }

    const info = requestCountArray.get(identifier);

    // Если превышен лимит 
    if (info.requestCount <= counter) {
        next();
    } else {
        countersLimitLogger.info(`countersLimitLogger - identifier: ${identifier}, URL: ${req.url}, Method: ${req.method}, IP: ${req.headers['x-real-ip']}, Date: ${new Date()}`);
        next(new TOO_MANY_REQ_M('Too Many Requests'));
    }
};

const limiterIp = rateLimit({
    windowMs: 1 * 60 * 1000, // 5 минут
    max: 150, // Максимальное количество запросов
    keyGenerator: function (req) {
        return req.headers['x-real-ip'];
    },
    handler: function (req, res) {
        res.status(429).json({ error: 'Too Many Requests' });
    }
});

module.exports = { limiterUUID, limiterIp };

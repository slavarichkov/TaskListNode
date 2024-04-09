const winston = require('winston');
const expressWinston = require('express-winston');

const requestLogger = expressWinston.logger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
  ],
});

//логгер ошибок
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
  format: winston.format.json(),
});


// Запрос, который не содержит существующий роут
const strangeReqLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'strangeReq.log' }),
  ],
});

// Превышен максимальный лимит
const countersLimitLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'countersLimit.log' }),
  ],
});

const authAttemptLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'authAttempt.log' }),
  ],
});


module.exports = {
  requestLogger,
  errorLogger,
  strangeReqLogger,
  countersLimitLogger,
  authAttemptLogger,
}; 
const express = require('express');
const mongoose = require('mongoose');
const process = require('process');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errors, isCelebrate } = require('celebrate');
require('dotenv').config();
const { corsSimple, corsMultiPart } = require('./middlewares/cors');
const { limiterUUID } = require('./middlewares/limiter');
const errorHandling = require('./middlewares/errorHandling'); // централизованный обработчик ошибок

// Ошибки
const NOT_FOUND_M = require('./utils/responce/NOT_FOUND');

//РОУТЫ
const publicRoutes = require('./routes/publicRoutes')

const { NODE_ENV, PORT, HOST_MONGODB } = process.env;

const app = express();

app.use(helmet());
app.set('trust proxy', true);
app.use(cookieParser());
app.use(bodyParser.json());

mongoose.set('strictQuery', true); // в mmongoose v7 параметр авто в false не строгое соотв схеме

//подключаемся к mongo и затем к серверу
// mongoose
//   .connect(NODE_ENV === 'production' ? HOST_MONGODB : 'mongodb://127.0.0.1/tasks')
//   .then(() => {
//     console.log('DB OK');
//     app.listen(NODE_ENV === 'production' ? PORT : 3000, () => {
//       console.log(`App listening on port ${NODE_ENV === 'production' ? PORT : 3000}`);
//     });
//   })
//   .catch((err) => console.log(err));

//Для разработки
mongoose
  .connect('mongodb://127.0.0.1/tasks')
  .then(() => {
    console.log('DB OK');
    app.listen(3000, () => {
      console.log(`App listening on port ${3000}`);
    });
  })
  .catch((err) => console.log(err));

// // Лимитер
// app.use(limiterUUID);
// мидлвары
app.use(corsSimple); // cors простой
app.use(corsMultiPart); // cors сложный
app.use(requestLogger); // логгер запросов

//Роуты, не требующие авторизации
app.use('/', publicRoutes);

app.use('*', (req, res, next) => { next(new NOT_FOUND_M('Cтраница не найдена')) }); // не существующая страница

// обработчики ошибок
app.use(errorLogger); // логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

// централизованный обработчик ошибок
app.use(errorHandling);

// глобальный обработчик ошибок
process.on('uncaughtException', (err, origin) => {
  console.log(`${origin} ошибка ${err} c текстом ${err.message} не была обработана. Обратите внимание!`);
});
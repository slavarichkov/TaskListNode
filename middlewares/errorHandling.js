module.exports = (err, req, res, next) => {
  console.error(err);
  // если у ошибки нет статуса, выставляем INTERNAL_SERVER_ERROR по умолчанию
  const { statusCode = 500, message } = err;
  res.status(statusCode)
    .header("Content-Type", "application/json")
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  return next();
};

const sameSiteMiddleware = (req, res, next) => {
    const cookies = req.cookies;
  
    if (cookies && cookies.yourCookieName && cookies.yourCookieName.includes('SameSite')) {
      // SameSite присутствует в значении cookie
      // Выполняйте необходимые действия для защиты сервера
      next();
    } else {
      // SameSite отсутствует в значении cookie
      // Возвращайте ошибку или выполняйте другие меры безопасности
      res.status(403).send('Access denied');
    }
  };
  
  module.exports = sameSiteMiddleware;
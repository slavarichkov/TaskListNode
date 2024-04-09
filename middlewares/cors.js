// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'localhost:3000',
  'localhost:3000',
  'http://localhost:3000',
  'https://localhost:3000',
  'https://test.auto-dnevnik.ru',
  'http://test.auto-dnevnik.ru',
];

function corsSimple(req, res, next) { // простые CORS-запросы
  const { origin } = req.headers; 
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  return next();
}

function corsMultiPart(req, res, next) { // сложные CORS-запросы
  const { method } = req; 
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  }
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.end();
  }
  return next();
}

module.exports = {
  corsSimple,
  corsMultiPart,
};

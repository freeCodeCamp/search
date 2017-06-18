module.exports = function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3080');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
};

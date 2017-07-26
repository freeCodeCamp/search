module.exports = function allowCrossDomain(req, res, next) {
  const allowedOrigins = [
    'localhost',
    'freecodecamp.org',
    'freecodecamp.com',
    'netlify.com'
  ];
  if (allowedOrigins.includes(req.hostname)) {
    res.header('Access-Control-Allow-Origin', `${req.protocol}://${req.hostname}/*`);
  } else {
    res.header('Access-Control-Allow-Origin', `*freecodecamp*`);
  }
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
};

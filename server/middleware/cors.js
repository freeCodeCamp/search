module.exports = function allowCrossDomain(req, res, next) {
  const allowedOrigins = [
    'beta.freecodecamp.com',
    'beta.freecodecamp.org',
    'freecodecamp.org',
    'freecodecamp.com',
    'netlify.com',
    'guide.netlify.com'
  ];
  if (allowedOrigins.includes(req.hostname)) {
    res.header('Access-Control-Allow-Origin', `${req.protocol}://${req.hostname}/*`);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
};

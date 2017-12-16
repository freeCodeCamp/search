const cors = require('cors');

const whitelistStrings = [
  'http://localhost:3000', // fcc dev
  'http://localhost:8000' // guides dev
];

const whitelistREs = [
  /(\.|https:\/\/)freecodecamp\.org/, // freecodecamp.org and any subdomain of
  /\.netlify\.com/, // deploy previews
];

function isTrustedOrigin(origin, callback) {
  if (
    whitelistREs.some(re => re.test(origin)) ||
    whitelistStrings.indexOf(origin) !== -1
  ) {
    callback(null, true);
  } else {
    callback(new Error('The request is not from an authorised origin'));
  }
}
const corsOptions = {
  origin: isTrustedOrigin,
  optionsSuccessStatus: 200
};
exports.cors = cors;
exports.options = corsOptions;

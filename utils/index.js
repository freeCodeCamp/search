const chalk = require('chalk');

function log(msg) {
  console.log(chalk.green(msg));
}

function info(msg) {
  console.log(chalk.blue(msg));
}

function error(msg) {
  console.log(chalk.red(msg));
}

module.exports = {
  log,
  info,
  error
};

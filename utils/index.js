const chalk = require('chalk');
const striptags = require('striptags');

function log(msg) {
  console.log(chalk.green(msg));
}

function info(msg) {
  console.log(chalk.blue(msg));
}

function error(msg) {
  console.log(chalk.red(msg));
}

function removeNonFormattingHTML(html) {
  return striptags(
    html,
    [
      'br',
      'b',
      'strong',
      'i',
      'em',
      'mark',
      'small',
      'del',
      'ins',
      'sub',
      'sup'
    ]
    );
}

module.exports = {
  log,
  info,
  error,
  removeNonFormattingHTML
};

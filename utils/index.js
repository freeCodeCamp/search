const { Observable } = require('rx');
const fse = require('fs-extra');
const chalk = require('chalk');
const format = require('date-fns/format');

function log(namespace = 'AnonDebug') {
  return (str = 'We need something to log', colour = 'green') => {
    const TS = format(new Date().getTime(), 'DD MMM YY - HH:mm:ss Z');
    console.log(chalk[colour](`${TS} (${namespace}): ${str}`));
  };
}

const isAFileRE = /(\.md|\.jsx?|\.html?)$/;
const isJSRE = /\.jsx?$/;
const shouldBeIgnoredRE = /^(\_|\.)/;
const excludedDirs = [
  'search'
];

function readDir(dir = __dirname, returnFiles = false) {
  const dirContent = fse.readdirSync(dir)
    .filter(dir => !excludedDirs.includes(dir))
    .filter(file => !(shouldBeIgnoredRE.test(file) || isJSRE.test(file)))
    .filter(file => file !== 'LICENSE.md');
  return returnFiles ?
    dirContent :
    dirContent.filter(item => !isAFileRE.test(item));
}

function parseDirectory(dirLevel, cb) {
  return Observable.from(readDir(dirLevel))
    .flatMap(dir => {
      const dirPath = `${dirLevel}/${dir}`;
      const subDirs = readDir(dirPath);
      if (!subDirs) {
        cb(dirPath);
        return Observable.of(null);
      }
      cb(dirPath);
      return parseDirectory(dirPath, cb);
    });
}

exports.log = log;
exports.readDir = readDir;
exports.parseDirectory = parseDirectory;

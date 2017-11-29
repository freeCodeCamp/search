const path = require('path');
const Rx = require('rx');
const svn = require('node-svn-ultimate');
const fse = require('fs-extra');
const hash = require('string-hash');
const { log } = require('../../utils');
const { bulkInsert, bulkUpsert } = require('../../elastic');
const { titleify } = require('./utils');
const logger = log('guides');
const { Observable } = Rx;


const isAFileRE = /(\.md|\.jsx?|\.html?)$/;
const shouldBeIgnoredRE = /^(\_|\.)/;
const excludedDirs = [
  'search'
];

const articlesDir = path.resolve(__dirname, './svn');

let articles = [];

function readDir(dir) {
  return fse.readdirSync(dir)
  .filter(item => !isAFileRE.test(item))
  .filter(dir => !excludedDirs.includes(dir))
  .filter(file => !shouldBeIgnoredRE.test(file));
}

function buildAndInsert(dirLevel) {
  const filePath = `${dirLevel}/index.md`;
  fse.open(filePath, 'r', (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        logger(
          `index.md does not exist in ${filePath.replace(/index\.md$/, '')}`,
          'yellow'
          );
      }
      logger(err.message, 'red');
      return;
    }
    fse.readFile(filePath, 'utf-8', (err, content) => {
      if (err) { logger(err.message, 'red'); }
      const title = dirLevel
        .slice(0)
        .split('/')
        .slice(-1)
        .join('');
      const pageTitle = titleify(title);

      const url = dirLevel
        .split('/')
        .slice(dirLevel.split('/').indexOf('svn') + 1)
        .join('/')
        .toLowerCase();
      const article = {
        body: content,
        title: pageTitle,
        url: `/${url}`,
        id: hash(url)
      };
      articles = [ ...articles, article];

      if (articles.length >= 150) {
        bulkInsert({ index: 'guides', type: 'article', documents: articles.slice(0) });
        articles = [];
      }
    });
    return null;
  });
}

function parseArticles(dirLevel) {
  return Observable.from(readDir(dirLevel))
    .flatMap(dir => {
      const dirPath = `${dirLevel}/${dir}`;
      const subDirs = readDir(dirPath);
      if (!subDirs) {
        buildAndInsert(dirPath);
        return Observable.of(null);
      }
      buildAndInsert(dirPath);
      return parseArticles(dirPath);
    });
}

function getGuideArticleData() {
  fse.remove(articlesDir, (err) => {
    if (err) {
      console.error(err.message);
      throw new Error(err.stack);
    }
    svn.commands.checkout(
      'https://github.com/freecodecamp/guides/trunk/src/pages',
      articlesDir,
      (err) => {
        if (err) {
          logger(err.message, 'red');
          throw new Error(err.stack);
        }
        logger('got guides');
        parseArticles(articlesDir)
          .subscribe(
            (dir)=> {
              if (dir) {
                parseArticles(dir);
              }
            },
            err => {
              logger(err.message, 'red');
              throw new Error(err);
            },
            () => {
              if (articles.length > 0) {
                bulkInsert({ index: 'guides', type: 'article', documents: articles.slice(0) });
              }
              logger('COMPLETE');
            }
          );
      });
  });
}

module.exports = getGuideArticleData;

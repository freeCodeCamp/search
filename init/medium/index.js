const Rx = require('rx');
const hash = require('string-hash');
const parser = require('rss-parser');

const { bulkInsert } = require('../../elastic');
const { Observable } = Rx;
const { info } = require('../../utils');

function getFeed() {
  return new Promise((resolve, reject) => {
    parser.parseURL('https://medium.com/feed/free-code-camp', (err, parsed) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(parsed.feed.entries);
    });
  });
}

module.exports = function getMediumData() {
  Observable.fromPromise(getFeed)
    .flatMap(entries => Observable.from(entries))
    .flatMap(({ title, link: url, 'content:encoded': content }) => {
      console.log(title);
      return Observable.of({
        title,
        content,
        url,
        id: hash(url)
      });
    })
    .toArray()
    .subscribe(
      articles => {
        info(`Got ${articles.length} medium articles for indexing`);
        bulkInsert({ index: 'medium', type: 'articles', documents: articles.slice(0) });
      }
    );
};

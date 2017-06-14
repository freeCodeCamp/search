/*
* This scrape is really slow due to us having to crawl the 
* sitemap without tripping the rate limits
*
* If you can think of a better way, please feel free to
* submit a PR
*/


const Rx = require('rx');
const hash = require('string-hash');
const textract = require('textract');

const { fromUrl } = textract;

const { bulkInsert } = require('../../elastic');
const { Observable } = Rx;
const { info } = require('../../utils');

function extractText(sitemap) {
  return new Promise((resolve, reject) => {
    fromUrl(sitemap, (err, text) => {
      if (err) {
        reject(err);
      }
      resolve(text);
    });
  });
}

const urlRegEx = /^https/;
const postsRegEx = /\/sitemap\/posts/;
const mediumFCCRegEx = /^https:\/\/.*?\.com\//;

function getMediumData() {
  const topLevel = 'https://medium.freecodecamp.com/sitemap/sitemap.xml';
  Observable.fromPromise(extractText(topLevel))
    .flatMap(text => {
      const postsLists = text
        .trim()
        .split(' ')
        .filter(text => urlRegEx.test(text) && postsRegEx.test(text));
      return Observable.zip(
        Observable.timer(0, 5000),
        Observable.from(postsLists),
        (a, b) => b
      );
    })
    .flatMap(postsUrl => {
      return Observable.fromPromise(extractText(postsUrl))
        .flatMap(text => {
          const singlePosts = text
            .trim()
            .split(' ')
            .filter(text => urlRegEx.test(text));
          return Observable.zip(
            Observable.timer(0, 1000),
            Observable.from(singlePosts),
            (a, b) => b
            );
        })
        .flatMap(postUrl => {
          const title = postUrl
            .slice(0)
            .replace(mediumFCCRegEx, '')
            .slice(0, -13) // removes a hash at the end of the URI
            .trim()
            .split('-')
            .map(str => str[0].toUpperCase() + str.slice(1))
            .join(' ');
          console.log(title);
          return Observable.fromPromise(extractText(postUrl))
            .flatMap(text => Observable.of({
              title,
              url: postUrl,
              content: text,
              id: hash(postUrl)
            })
            );
        });
    })
    .subscribe(
      articles => {
        info(`Got ${articles.length} medium articles for indexing`);
        bulkInsert({ index: 'medium', type: 'articles', documents: articles.slice(0) });
      },
      err => {
        console.error(err);
      }
    );
}

module.exports = getMediumData;
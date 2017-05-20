const Rx = require('rx');
const request = require('request');

const {
  error,
  log,
  info,
  removeNonFormattingHTML
  } = require('../../utils');

const { Observable } = Rx;
let pageCount = 0;

function apiCall(path, page) {
  const pageString = page ? `?page=${page}&_=${Date.now()}` : '';
  const url = `https://forum.freecodecamp.com/${path}${pageString}`;
  const options = {
    url
  };
  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        reject(err);
      }
      const response = JSON.parse(body);
      resolve(response);
    });
  });
}

function getCategoryList() {
  const path = 'categories.json';
  return Observable.fromPromise(apiCall(path, null));
}

function getTopicsList(category, page) {
  const path = `c/${category}.json`;
  log(`getting ${category} topics, page ${page}`);
  return Observable.fromPromise(apiCall(path, page))
    ;
}

function getSingleTopic(topicId) {
  const path = `t/${topicId}.json`;
  return Observable.fromPromise(apiCall(path, null));
}

function getBulkTopics(category, pageCount) {
  return getTopicsList(category, pageCount)
      .flatMap(
        ({ topic_list: { topics, more_topics_url } }) => {
          console.log('got %d topics', topics.length);
          // get a topic from each id
          Observable.zip(
            Observable.timer(0, 300),
            Observable.from(topics),
            (a, b) => b)
            .selectMany(({ id }) => {
              info(id);
              return getSingleTopic(id);
            })
            .flatMap(topic => {
                  const {
                    title,
                    id,
                    category_id,
                    post_stream: { posts }
                  } = topic;
                  const body = removeNonFormattingHTML(posts[0].cooked);
                  log(`got ${title}`);
                  const article = {
                    body,
                    category_id,
                    id,
                    title
                  };
                  log(article.body);
                  return Observable.of(article);
                })
            .subscribe(
                topics => {
                  info(`Got ${topics.length} articles ready fo indexing`);
                },
                e => {
                  error(`singleTopic Error: ${e}`);
                },
                () => {
                  log(`.................Completed page ${pageCount}.....................`);
                  // if (more_topics_url) {
                  //   pageCount ++;
                  //   getNewTopics(updateWiki);
                  // } 
                });
        });
}

function milkDiscourse(isUpdate) {
  return getCategoryList()
    .flatMap(({category_list: { categories }}) => categories)
    .map(category => category.slug)
    .map(category => {
      getBulkTopics(category, 0)
      .subscribe(() => {});
    })
    .subscribe(()=>{});
}

module.exports = milkDiscourse;

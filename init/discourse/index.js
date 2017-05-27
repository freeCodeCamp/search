const Rx = require('rx');
const request = require('request');

const {
  error,
  log,
  info
} = require('../../utils');

const {
  bulkInsert
} = require('../../elastic');

const { Observable } = Rx;

let topicsMap = {};

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
      let response;
      try {
        response = JSON.parse(body);
        resolve(response);
      }
      catch(err) {
        reject(err);
      }
    });
  });
}

function getSingleTopic(topicId) {
  const path = `t/${topicId}.json`;
  return Observable.fromPromise(apiCall(path, null));
}

function getTopicsList(category, page) {
  const path = `c/${category}.json`;
  info(`getting ${category} topics, page ${page}`);
  return Observable.fromPromise(apiCall(path, page))
    .subscribe(
      ({ topic_list: { topics, more_topics_url }}) => {
        Observable.zip(
          Observable.timer(0, 250),
          Observable.from(topics),
          (a, b) => b
        ) 
        .selectMany(topic => getSingleTopic(topic.id))
        .filter(topic => topic.user_id === 15462) // camperBot.user_id === 15462
        .subscribe(
            topic => {
              const {
                title,
                id,
                category_id,
                post_stream: { posts },
                slug
              } = topic;
              const body = posts[0].cooked;
              log(`got ${title}`);
              const article = {
                body,
                category_id,
                id,
                title,
                url: `https://forum.freecodecamp.com/t/${slug}/${id}`
              };

              topicsMap[category] = topicsMap[category] ?
                [ ...topicsMap[category], article ] :
                [ article ];
            },
            e => {
              console.trace('singleTopic Error: ', e);
            },
            () => {
              log(`.................Completed ${category} page ${page}.....................`);
              if (more_topics_url) {
                getTopicsList(category, ++page);
              }
              info(`Got ${topicsMap[category].length} topics for ${category}, ready for indexing`);
              bulkInsert({index: 'forum', type: category, documents: topicsMap[category].slice(0) });
              topicsMap[category] = [];
            });
      },
      err => {
        error(`TopicsList Error: ${err}`);
      });
}

function milkDiscourse() {
  getTopicsList('wiki', 0);
}

module.exports = milkDiscourse;

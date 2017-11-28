require('dotenv').config();

const { Observable } = require('rx');
const { getStoryData } = require('./blog');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
const getGuideArticleData = require('./guides');
const { deleteAll } = require('../elastic');

const dataSources = [
  getGuideArticleData,
  // getYoutubeData,
  getChallengeData,
  getStoryData
];

function init() {
  deleteAll()
  .then(() => {
    Observable.zip(
      Observable.timer(0, 2000),
      Observable.from(dataSources),
      (a, b) => b
      )
      .subscribe(fn => {
        fn();
      });
  });
}

init();

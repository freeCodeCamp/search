require('dotenv').config();
const Rx= require('rx');

/*
* Getting Medium Articles is causing problems
* right now. It is now a TODO
*/


const getDiscourseData = require('./discourse');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
// const getMediumData = require('./medium');
const { deleteAll } = require('../elastic');

const { Observable } = Rx;

function init() {
  deleteAll();
  const source = Observable.zip(
  // allow time for the delete Op to complete before emitting first fn
  // stagger fn's so as not to overload elasticsearch indexing
    Observable.timer(1000, 3000),
    Observable.from(
      [
        getYoutubeData,
        getChallengeData,
        getDiscourseData
      ]
      ),
    (a, b) => b
  );

  source.subscribe(fn => fn());
}

init();

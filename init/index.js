require('dotenv').config();
const Rx= require('rx');

const milkDiscourse = require('./discourse');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
const getMediumData = require('./medium');
const { deleteAll } = require('../elastic');

const { Observable } = Rx;

function init() {
  deleteAll();
  const source = Observable.zip(
  // allow time for the delete Op to complete before emitting first fn
  // stagger fn's so as not to overload `bulkIndex`
    Observable.timer(1000, 3000),
    Observable.from(
      [
        getMediumData,
        getYoutubeData,
        getChallengeData,
        milkDiscourse
      ]
      ),
    (a, b) => b
  );

  source.subscribe(fn => fn());
}

init();

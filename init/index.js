require('dotenv').config();
const milkDiscourse = require('./discourse');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
const { deleteAll } = require('../elastic');

function init() {
  deleteAll();
  // allow time for the delete Op to complete
  setTimeout(() => {
    milkDiscourse();
    getYoutubeData();
    getChallengeData();
  }, 1000);
}

init();

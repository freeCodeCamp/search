const milkDiscourse = require('./discourse');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
const { deleteAll } = require('../elastic');

module.exports = function init() {
  deleteAll();
  // allow time for the delete Op to complete
  setTimeout(() => {
    milkDiscourse();
    getYoutubeData();
    getChallengeData();
  }, 1000);
};

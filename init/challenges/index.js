const { Observable } = require('rx');
const getChallenges = require('./seed/getChallenges');

const {
  bulkInsert
} = require('../../elastic');

function dasherize(name) {
  return ('' + name)
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^a-z0-9\-\.]/gi, '')
    .replace(/\:/g, '');
}

function snippetGen(description) {
  if (!description) {
    return '';
  }
  return description
    .join(' ')
    .slice(0, 100)
    .trim()
    + '...';
}

function getChallengeData() {

  Observable.from(getChallenges())
    .flatMap(
      ({ name, challenges })=> {
        const block = dasherize(name);
        const formattedChallenges = challenges
          .reduce((acc, current) => {
            const { id, title, description } = current;
            const dashedName = dasherize(title);
            const formattedChallenge = {
              blockName: name,
              id,
              title,
              dashedName,
              description: description ? description.join('').trim() : '',
              snippet: snippetGen(description),
              url: `https://freecodecamp.com/${block}/${dashedName}`
            };
            return [ ...acc, formattedChallenge ];
          }, []);
        return Observable.of({
          block,
          challenges: formattedChallenges
        });
      })
      .subscribe(
        (challengeBlock => {
          const { block, challenges } = challengeBlock;
          bulkInsert({ index: 'challenge', type: block, documents: challenges });
        })
      );
}

module.exports = getChallengeData;

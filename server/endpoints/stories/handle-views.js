const { getViewCount, incrementViewCount } = require('../../../elastic/index.js');
const { log } = require('../../../utils');

module.exports = function (app) {

  app.get('/get-views', (req, res) => {
    res.sendStatus(400).end({'error': 'An id must be provided'});
  });

  app.get('/get-views/:storyId', async (req, res) => {
    const { storyId } = req.params;
    if (!storyId) {
      res.sendStatus(400).end({'error': 'An id must be provided'});
      return;
    }
    let views;
    try {
      views = await getViewCount(storyId);
    }
    catch (err) {
      log(`
      (getViewCount): ${storyId}
      ${err.message}
      `, 'red');
      views = false;
    }
    if (views) {
      res.json(JSON.stringify({views}));
    } else {
      res.sendStatus(400).end('KO');
    }
  });

  app.get('/increment-views', (req, res) => {
    res.sendStatus(400).end({'error': 'An id must be provided'});
  });

  app.get('/increment-views/:storyId', async (req, res) => {
    const { storyId } = req.params;
    if (!storyId) {
      res.sendStatus(400).end({'error': 'An id must be provided'});
    }
    let result;
    try {
      result = await incrementViewCount(storyId);
    }
    catch (err) {
      log(`
      (incrementViewCount): ${storyId}
      ${err.message}
      `, 'red');
      result = false;
    }
    if (result) {
      res.sendStatus(200).end('OK');
    } else {
      res.sendStatus(400).end('KO');
    }
  });
};

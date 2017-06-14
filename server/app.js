const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');

const { Observable } = Rx;


const { findTheThings$ } = require('../elastic');

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/search', (req, res) => {
  const { q: query } = req.query;
  findTheThings$(query)
    .subscribe(
      hits => {
        res.json(hits).end();
      }
    );
});

module.exports = app;
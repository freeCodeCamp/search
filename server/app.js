const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');
const app = express();
const morgan = require('morgan');

const { findTheThings } = require('../elastic');
const cors = require('./middleware/cors');

const { Observable } = Rx;

app.use(morgan('Method :method - URL :url - Status :status - Response Time :response-time ms'));
app.use(helmet());
app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.get('/search', (req, res) => {
  const { q: query } = req.query;
  Observable.fromPromise(findTheThings(query))
    .subscribe(
      hits => {
        res.json(hits).end();
      },
      err => {
        console.error(err);
        res.json(err).end();
      }
    );
});

app.get('*', (req, res) => {
  res.status(400).render('noRoute', { route: req.originalUrl });
});

module.exports = app;

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { findTheThings } = require('../elastic');
const cors = require('./middleware/cors');

const PORT = process.env.PORT || 7000;

const { Observable } = Rx;

io.on('connection', function(socket) {
  socket.on('search-for-this', (query, cb) => {
    Observable.fromPromise(findTheThings(query))
      .subscribe(
        hits => {
          cb(hits);
        }
      );
  });
  socket.emit('connection');
});

app.use(helmet());
app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

http.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}!`);
});
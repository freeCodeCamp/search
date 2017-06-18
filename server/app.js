const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { findTheThings } = require('../elastic');
const cors = require('./middleware/cors');

const { Observable } = Rx;

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('message', (msg) => {
    console.log(msg);
  });
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

module.exports = app;
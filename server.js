test 1

hi..test

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();

const http = require('http').Server(app);

mongoose.connect(config.database, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('DB connected');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

const api = require('./app/routes/api')(app, express);
app.use('/api', api);

http.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Listening on port 8080');
  }
});

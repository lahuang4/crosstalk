var bodyParser = require('body-parser');
var express = require('express');

var messages = require("./messages.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const PORT = 4000;

app.get('/user', function(req, res) {
  res.send('hello ' + req.query.username);
});

app.post('/user', function(req, res) {
  console.log('got the body: ');
  console.log(req.body);

  res.send('POST request');
});

app.post('/sendMessage', function(req, res) {
  messages.receiveMessage(req, res);
});

app.listen(PORT);
console.log("Running server on on port %s", PORT);
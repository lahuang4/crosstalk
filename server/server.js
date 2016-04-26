var bodyParser = require('body-parser');
var express = require('express');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/user', function(req, res) {
  res.send('hello ' + req.query.username);
});

app.post('/user', function(req, res) {
  console.log('got the body: ');
  console.log(req.body);

  res.send('POST request');
});

app.listen(3000);

var bodyParser = require("body-parser");
var express = require("express");

var users = require("./users.js");
var channels = require("./channels.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const PORT = 5000;

app.post("/login", function(req, res) {
  users.login(req, res);
});

app.post("/logout", function(req, res) {
  users.logout(req, res);
});

app.post("/createChannel", function(req, res) {
  channels.createChannel(req, res);
});

app.post("/joinChannel", function(req, res) {
  channels.joinChannel(req, res);
});

app.post("/leaveChannel", function(req, res) {
  channels.leaveChannel(req, res);
});

app.listen(PORT);
console.log("Running directory on on port %s", PORT);
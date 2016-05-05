var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors')

var Tree = require("./models/tree.js");
var users = require("./users.js");
var channels = require("./channels.js");
var messages = require("./messages.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

const PORT = 4000;

// Server methods
app.post('/sendMessage', function(req, res) {
  messages.receiveMessage(req, res);
});

// Client information
exports.username = "";
exports.address = "http://localhost:4000";
exports.channels = {};
exports.directory = "http://localhost:5000";
exports.log = new Tree();

// Client methods
app.post('/login', function(req, res) {
  users.login(req, res);
});

app.post('/joinChannel', function(req, res) {
  channels.joinChannel(req, res);
});

app.post('/leaveChannel', function(req, res) {
  channels.leaveChannel(req, res);
});

app.listen(PORT);
console.log("Running server on on port %s", PORT);
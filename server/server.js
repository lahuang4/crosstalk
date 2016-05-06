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
app.post('/receiveMessage', function(req, res) {
  messages.receiveMessage(req, res);
});

app.post('/sync', function(req, res) {
  messages.sync(req, res);
});

var ipaddr = "localhost";
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  ipaddr = add;
});

// Client information
exports.username = "";
exports.address = "http://" + "18.111.82.69" + ":4000";
exports.channel = "";
exports.channels = {};
exports.directory = "http://18.189.75.154:5000";
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

app.post('/sendMessage', function(req, res) {
  messages.sendMessageToChannel(req, res);
});

app.post('/getLog', function(req, res) {
  res.json({
    username: exports.username,
    channel: exports.channel,
    members: exports.channels[exports.channel],
    log: exports.log
  });
});

app.listen(PORT);
console.log("Running server on on port %s", PORT);

// Sync log and chat channel members with a random neighbor
setInterval(messages.syncWithRandomPeer, 1000); // TODO: 500 msec or fewer


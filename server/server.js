var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');

var Tree = require("./models/tree.js");
var users = require("./users.js");
var channels = require("./channels.js");
var messages = require("./messages.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

var lock = messages.lock;

const PORT = 4000;

// Check if this server is in the same partition as the other server
var partition = function(req, res, next) {
  if (req.body.partition === exports.partition) {
    next()
  } else {
    console.log("not in partition");
  }
}

// Server methods
app.post('/hello', partition, function(req, res) {
  // Add person to your users
  exports.channels[exports.channel][req.body.username] = req.body.address;
  console.log("Hello " + req.body.username + "! My members list is now " + JSON.stringify(exports.channels[exports.channel]));
  res.json({ success: true });
});

app.post('/goodbye', partition, function(req, res) {
  // Remove person from your users
  delete exports.channels[exports.channel][req.body.username];
  console.log("Goodbye " + req.body.username + "! My members list is now " + JSON.stringify(exports.channels[exports.channel]));
  res.json({ success: true });
});

app.post('/receiveMessage', partition, function(req, res) {
  messages.receiveMessage(req, res);
});

app.post('/sync', partition, function(req, res) {
  messages.sync(req, res);
});

// Client information
exports.username = "";
// exports.address = "http://" + "18.111.82.69" + ":4000";
exports.address = "http://localhost:4000";
exports.partition = "";
exports.channel = "";
exports.channels = {};
// exports.directory = "http://18.189.75.154:5000";
exports.directory = "http://52.32.209.19:5000";
exports.log = new Tree();
exports.inactiveUsers = new Set();

require("externalip")(function (err, ip) {
  exports.address = "http://" + ip + ":4000";
});

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

app.post('/setPartition', function(req, res) {
  exports.partition = req.body.partition;
  console.log("Set partition to be " + exports.partition);
});

app.post('/getLog', function(req, res) {
  lock.readLock(function(release) {
    res.json({
      username: exports.username,
      channel: exports.channel,
      members: exports.channels[exports.channel],
      log: exports.log
    });

    release();
  });
});

app.listen(PORT);
console.log("Running server on on port %s", PORT);

// Sync log and chat channel members with a random neighbor.
setInterval(messages.syncWithRandomPeer, 500);

// Sync latest log with users that were inactive -- users we haven't heard back from upon trying to contact them.
setInterval(messages.contactInactiveUsers, 3000);
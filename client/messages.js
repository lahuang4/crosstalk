var exports = module.exports = {};

var request = require('request');

var client = require('./client.js');
var Node = require("../server/models/node.js");
var Tree = require("../server/models/tree.js");

// Sends message to everyone in the channel.
exports.sendMessageToChannel = function(channel, msg) {
  msg = client.username + ": " + msg;

  // Add message to my log.
  node = new Node(msg);
  client.log.leaves.forEach(function(leaf, index) {
    client.log.directory[leaf].addChild(node);
    node.addParent(client.log.directory[leaf]);
  });
  client.log.directory[node._id] = node;
  client.log.leaves = new Set();
  client.log.leaves.add(node._id);

  console.log("Added message to my log. My directory: " + JSON.stringify(client.log.directory));

  // Send out message to everyone else.
  var members = client.channels[channel];
  var address;
  Object.keys(members).forEach(function(user, index) {
    if (user != client.username) {
      address = members[user];
      sendMessage(address, client.username, msg);    
    }
  });
}

sendMessage = function(dst, user, msg) {
  console.log("Sending message " + msg + " to " + dst + "/sendMessage");
  request.post(
    dst + "/sendMessage",
    {
      json: {
        user: user,
        message: msg,
        log: client.log
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log("Received response body " + JSON.stringify(body))
      }
    }
  );
}
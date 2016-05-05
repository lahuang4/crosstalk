var exports = module.exports = {};

var client = require("./server.js");
var Tree = require("./models/tree.js");
var Node = require("./models/node.js");

// Merges the message with the chat log.
exports.receiveMessage = function(req, res) {
  var user = req.body.user;
  var msg = req.body.message;
  var log = req.body.log;

  console.log("Received chat log: \n" + JSON.stringify(log));

  // Parse the log object into a Tree.
  var peerLog = new Tree(log);

  // Merge the log with my log.
  client.log.merge(peerLog);

  console.log("My log after merging: \n" + JSON.stringify(client.log));

  res.json({ success: true, log: client.log });
}

// Sends message to everyone in the channel.
exports.sendMessageToChannel = function(channel, msg) {
  msg = client.username + ": " + msg;

  // Add message to my log.
  var node = new Node(msg);
  client.log.leaves.forEach(function(leaf, index) {
    client.log.directory[leaf].addChild(node);
  });
  client.log.directory[node._id] = node;
  client.log.leaves = [];
  client.log.leaves.push(node._id);

  // Send out message to everyone else.
  var members = client.channels[channel];
  var address;
  Object.keys(members).forEach(function(user, index) {
    if (user != client.username) {
      address = members[user];
      sendMessageToUser(address, client.username, msg);
    }
  });
}

// Sends message to the particular destination.
sendMessageToUser = function(dst, user, msg) {
  console.log("Sending message " + msg + " to " + dst + "/sendMessage");
  console.log("Sending client log: \n" + JSON.stringify(client.log));
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
        console.log("Received response body " + JSON.stringify(body));

        // Parse the object into a Tree.
        var peerLog = new Tree(body.log);

        // Merge the returned log with my log.
        client.log.merge(peerLog);

        console.log("Merged returned log. My log: \n" + JSON.stringify(client.log));
      }
    }
  );
}
var exports = module.exports = {};

var request = require("request");

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

// Syncs the log and chat channel members list.
exports.sync = function(req, res) {
  var user = req.body.user;
  var members = req.body.members;
  var log = req.body.log;

  console.log("Received chat log: \n" + JSON.stringify(log));

  // Parse the log object into a Tree.
  var peerLog = new Tree(log);

  // Merge the log with my log.
  client.log.merge(peerLog);

  console.log("My log after merging: \n" + JSON.stringify(client.log));

  // TODO: Merge chat channel members as well.

  res.json({ success: true, log: client.log });
}

// Sends message to everyone in the channel.
exports.sendMessageToChannel = function(req, response) {
  var msg = client.username + ": " + req.body.msg;

  // Add message to my log.
  var node = new Node(msg);
  client.log.leaves.forEach(function(leaf, index) {
    client.log.directory[leaf].addChild(node);
  });
  client.log.directory[node._id] = node;
  client.log.leaves = [];
  client.log.leaves.push(node._id);

  // Send out message to everyone else.
  var members = client.channels[client.channel];
  var address;
  Object.keys(members).forEach(function(user, index) {
    if (user != client.username) {
      address = members[user];
      // TODO: This is asynchronous, so we should be able to reply to the user sending the message immediately.
      // If we failed to send the message out, we should add that message to the queue of things we need to send to that user and try again later.
      sendMessageToUser(address, msg);
    }
  });

  response.json({
    msg: msg,
    log: client.log
  });
}

// Sends message to the particular destination.
sendMessageToUser = function(dst, msg) {
  console.log("Sending message " + msg + " to " + dst + "/receiveMessage");
  console.log("Sending client log: \n" + JSON.stringify(client.log));
  request.post(
    dst + "/receiveMessage",
    {
      json: {
        user: client.username,
        message: msg,
        log: client.log
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log("Received response body " + JSON.stringify(body));
        client.inactiveUsers.delete(dst);

        // Parse the object into a Tree.
        var peerLog = new Tree(body.log);

        // Merge the returned log with my log.
        client.log.merge(peerLog);

        console.log("Merged returned log. My log: \n" + JSON.stringify(client.log));
      } else {
        // We didn't successfully send the message to the user, so we'll try again later.
        client.inactiveUsers.add(dst);
      }
    }
  );
}

syncWithPeer = function(dst) {
  console.log("Syncing with user at address " + dst);
  request.post(
    dst + "/sync",
    {
      json: {
        user: client.username,
        members: client.channels[client.channel],
        log: client.log
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log("Received response body " + JSON.stringify(body));
        client.inactiveUsers.delete(dst);

        // Parse the object into a Tree.
        var peerLog = new Tree(body.log);

        // Merge the returned log with my log.
        client.log.merge(peerLog);

        console.log("Merged returned log. My log: \n" + JSON.stringify(client.log));

        // TODO: Merge chat channel members lists as well.
      }
    }
  );
}

// Syncs chat log and chat channel members with another user.
exports.syncWithRandomPeer = function() {
  var members = client.channels[client.channel];
  if (members && Object.keys(members).length > 1) {
    var address = randomValue(members);
    console.log("Syncing with member at address " + address + "! members is " + JSON.stringify(members));
    dst = address;
  } else {
    return;
  }
  syncWithPeer(dst);
}

function randomValue(obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]];
}

exports.contactInactiveUsers = function() {
  client.inactiveUsers.forEach(function(dst) {
    syncWithPeer(dst);
  });
}
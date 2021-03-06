var exports = module.exports = {};

var request = require("request");
var ReadWriteLock = require("rwlock");
var _ = require("lodash");

var client = require("./server.js");
var Tree = require("./models/tree.js");
var Node = require("./models/node.js");

var lock = new ReadWriteLock();

exports.lock = lock;

// Merges the message with the chat log.
exports.receiveMessage = function(req, res) {
  var user = req.body.user;
  var address = req.body.address;
  var msg = req.body.message;
  var log = req.body.log;

  if (_.has(req.body, "logHash")) {
    lock.writeLock(function(release) {
      if (client.log.hashCode() === req.body.logHash) {

        // Add message to my log.
        var node = new Node(msg);
        node._id = req.body.messageID;
        client.log.leaves.forEach(function(leaf, index) {
          client.log.directory[leaf].addChild(node);
        });
        client.log.directory[node._id] = node;
        client.log.leaves = [];
        client.log.leaves.push(node._id);

        res.json({ success: true, matches: true });
      } else {
        res.json({ success: true, matches: false });
      }

      release();
    });
  } else {
    console.log("Received chat log: \n" + JSON.stringify(log));
    client.channels[client.channel][user] = address;
    console.log("My member list: " + JSON.stringify(client.channels[client.channel]));

    // Parse the log object into a Tree.
    var peerLog = new Tree(log);

    lock.writeLock(function(release) {
      // Merge the log with my log.
      client.log.merge(peerLog);

      console.log("My log after merging: \n" + JSON.stringify(client.log));

      var copiedLog = JSON.parse(JSON.stringify(client.log));
      release();
      res.json({ success: true, matches: true, log: copiedLog });
    });
  }
}

// Syncs the log and chat channel members list.
exports.sync = function(req, res) {
  var user = req.body.user;
  var address = req.body.address;
  var members = req.body.members;
  var log = req.body.log;

  if (_.has(req.body, "logHash")) {
    lock.readLock(function(release) {
      if (client.log.hashCode() === req.body.logHash) {
        res.json({ success: true, matches: true });
      } else {
        res.json({ success: true, matches: false });
      }

      release();
    });
  } else {
    console.log("Received chat log: \n" + JSON.stringify(log));
    client.channels[client.channel][user] = address;
    console.log("My member list: " + JSON.stringify(client.channels[client.channel]));

    // Parse the log object into a Tree.
    var peerLog = new Tree(log);

    lock.writeLock(function(release) {
      // Merge the log with my log.
      client.log.merge(peerLog);

      console.log("My log after merging: \n" + JSON.stringify(client.log));

      var copiedLog = JSON.parse(JSON.stringify(client.log));
      release();
      res.json({ success: true, matches: true, log: copiedLog });
    });
  }
}

// Sends message to everyone in the channel.
exports.sendMessageToChannel = function(req, response) {
  var msg = client.username + ": " + req.body.msg;

  var log;
  lock.writeLock(function(release) {
    var oldLogHash = client.log.hashCode();

    // Add message to my log.
    var node = new Node(msg);
    client.log.leaves.forEach(function(leaf, index) {
      client.log.directory[leaf].addChild(node);
    });
    client.log.directory[node._id] = node;
    client.log.leaves = [];
    client.log.leaves.push(node._id);

    console.log("In sendMessage, added new node as leaf. My log: " + JSON.stringify(client.log));

    // Copy the tree
    log = new Tree(JSON.parse(JSON.stringify(client.log)));
    release();

    // Send out message to everyone else.
    var members = client.channels[client.channel];
    var address;
    Object.keys(members).forEach(function(user, index) {
      if (user != client.username) {
        address = members[user];
        sendMessageToUser(address, msg, node._id, log, oldLogHash);
      }
    });

    response.json({
      msg: msg,
      log: log
    });
  });

}

// Sends message to the particular destination.
sendMessageToUser = function(dst, msg, nodeID, log, oldLogHash) {
  console.log("Sending message " + msg + " to " + dst + "/receiveMessage");
  console.log("Sending client log: \n" + JSON.stringify(log));
  request.post(
    dst + "/receiveMessage",
    {
      json: {
        user: client.username,
        address: client.address,
        message: msg,
        messageID: nodeID,
        logHash: oldLogHash,
        partition: client.partition
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log("Received response body " + JSON.stringify(body));
        client.inactiveUsers.delete(dst);

        if (!body.matches) {
          request.post(
            dst + "/receiveMessage",
            {
              json: {
                user: client.username,
                address: client.address,
                message: msg,
                log: log,
                partition: client.partition
              }
            },
            function(err, res, body) {
              if (!err && res.statusCode == 200) {
                console.log("Received response body " + JSON.stringify(body));
                client.inactiveUsers.delete(dst);

                // Parse the object into a Tree.
                var peerLog = new Tree(body.log);

                lock.writeLock(function(release) {
                  // Merge the returned log with my log.
                  client.log.merge(peerLog);

                  console.log("Merged returned log. My log: \n" + JSON.stringify(client.log));   
                  release();
                });
              } else {
                // We didn't successfully send the message to the user, so we'll try again later.
                client.inactiveUsers.add(dst);
              }
            }
          );
        }
      } else {
        // We didn't successfully send the message to the user, so we'll try again later.
        client.inactiveUsers.add(dst);
      }
    }
  );
}

syncWithPeer = function(dst) {
  console.log("Syncing with user at address " + dst);

  var log, logHash;
  lock.readLock(function(release) {
    log = JSON.parse(JSON.stringify(client.log));
    logHash = client.log.hashCode();
    release();

    request.post(
      dst + "/sync",
      {
        json: {
          user: client.username,
          address: client.address,
          members: client.channels[client.channel],
          logHash: logHash,
          partition: client.partition
        }
      },
      function(err, res, body) {
        if (!err && res.statusCode == 200) {
          console.log("Received response body " + JSON.stringify(body));
          client.inactiveUsers.delete(dst);

          if (!body.matches) {
            request.post(
              dst + "/sync",
              {
                json: {
                  user: client.username,
                  address: client.address,
                  members: client.channels[client.channel],
                  log: log,
                  partition: client.partition
                }
              },
              function(err, res, body) {
                if (!err && res.statusCode == 200) {
                  console.log("Received response body " + JSON.stringify(body));
                  client.inactiveUsers.delete(dst);

                  lock.writeLock(function(release) {
                    // Parse the object into a Tree.
                    var peerLog = new Tree(body.log);

                    // Merge the returned log with my log.
                    client.log.merge(peerLog);

                    console.log("Merged returned log. My log: \n" + JSON.stringify(client.log));

                    release();
                  });
                }
              }
            );
          }
        }
      }
    );
  });
}

// Syncs chat log and chat channel members with another user.
exports.syncWithRandomPeer = function() {
  var members = client.channels[client.channel];
  if (members && Object.keys(members).length > 1) {
    var address = randomValue(members);
    while (address === client.address) {
      address = randomValue(members);
    }
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
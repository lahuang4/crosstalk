var exports = module.exports = {};

var client = require("../client/client.js");
var Tree = require("./models/tree.js");

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
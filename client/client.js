var exports = module.exports = {};

var channels = require("./channels.js");
var messages = require("./messages.js");
var Node = require("../server/models/node.js");
var Tree = require("../server/models/tree.js");

// Client information
exports.username = "user1";
exports.address = "http://localhost:4000";
exports.channels = {};
exports.directory = "http://localhost:3000";
exports.log = new Tree();

// Connect to a chat channel
console.log("Connecting to channel1...");

channels.joinChannel("channel1").then(function() {
  console.log("Sending message:");
  return messages.sendMessageToChannel("channel1", "Hello world!"); // this doesn't return promise yet though
});
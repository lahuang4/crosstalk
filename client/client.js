var exports = module.exports = {};

var channels = require("./channels.js");
var messages = require("./messages.js");

// Client information
exports.username = "user1";
exports.address = "http://localhost:4000";
exports.channels = {};
exports.directory = "http://localhost:3000";

// Connect to a chat channel
console.log("Connecting to channel1...");
channels.joinChannel("channel1");
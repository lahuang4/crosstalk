var channels = require("./channels.js");
var messages = require("./messages.js");

// Connect to a chat channel
console.log("Connecting to channel1...");

channels.joinChannel("channel1").then(function() {
  console.log("Sending message:");
  return messages.sendMessageToChannel("channel1", "Hello world!"); // this doesn't return promise yet though
});
var exports = module.exports = {};

var request = require('request');

var client = require('./client.js');

// Requests the directory to create a new channel, and updates the membership list for that channel upon success.
exports.createChannel = function(channel) {
  console.log("Creating channel " + channel + ".");
  request.post(
    client.directory + "/createChannel",
    {
      json: {
        user: client.username,
        channel: channel,
        address: client.address
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        if (body.success) {
          // Get the members in the channel.
          client.channels[channel] = body.members;
          console.log("Successfully created channel " + channel + ", which has members " + body.members + ".");
        } else if (body.channel_exists) {
          // If the channel exists already, we're set.
          console.log("Channel " + channel + " already exists.")
        } else {
          console.log("An unhandled error occurred.")
        }
      } else {
        exports.createChannel(channel);
      }
    }
  );
}

// Requests the directory to add this user to a channel, and updates the membership list for that channel upon success.
exports.joinChannel = function(channel) {
  console.log("Joining channel " + channel + ".");
  request.post(
    client.directory + "/joinChannel",
    {
      json: {
        user: client.username,
        channel: channel,
        address: client.address
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        if (body.success) {
          // Get the members in the channel.
          client.channels[channel] = body.members;
          console.log("Successfully joined channel " + channel + ", which has members " + body.members + ".");
        } else if (!body.channel_exists) {
          // If the channel didn't exist, we create it.
          exports.createChannel(channel);
        } else {
          console.log("An unhandled error occurred.")
        }
      } else {
        // If something went wrong (for example, a timeout), we try again.
        exports.joinChannel(channel);
      }
    }
  );
}

// Requests the directory to remove this user from a channel, and clears the membership list for that channel upon success.
exports.leaveChannel = function(channel) {
  console.log("Leaving channel " + channel + ".");
  request.post(
    client.directory + "/leaveChannel",
    {
      json: {
        user: client.username,
        channel: channel,
        address: client.address
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        if (body.success) {
          client.channels[channel] = {};
          console.log("Successfully left channel " + channel + ".");
        } else if (body.channel_exists && !body.user_in_channel) {
          console.log("User was not a member of channel " + channel + ".");
        } else if (!body.channel_exists) {
          console.log("Channel " + channel + " does not exist.");
        } else {
          console.log("An unhandled error occurred.")
        }
      }
    }
  );
}
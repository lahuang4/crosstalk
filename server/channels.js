var exports = module.exports = {};

var request = require("request");

var client = require("./server.js");

// Requests the directory to create a new channel, and updates the membership list for that channel upon success.
createChannel = function(req, response) {
  var channel = req.body.channel;
  console.log("Trying to create channel " + channel + ".");
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

          response.json(body);
        } else if (body.channel_exists) {
          // If the channel exists already, we're set.
          response.send("Channel " + channel + " already exists.");
        } else {
          response.send("An unhandled error occurred.");
        }
      } else {
        createChannel(channel);
      }
    }
  );
}

// Requests the directory to add this user to a channel, and updates the membership list for that channel upon success.
exports.joinChannel = function(req, response) {
  var channel = req.body.channel;

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

          // TODO: Get the latest version of the log from somebody.

          response.json(body);
        } else if (!body.channel_exists) {
          // If the channel didn't exist, we create it.
          createChannel(req, response);
        } else {
          response.send("An unhandled error occurred.");
        }
      } else {
        exports.joinChannel(res, response);
      }
    }
  );
}

// Requests the directory to remove this user from a channel, and clears the membership list for that channel upon success.
exports.leaveChannel = function(req, response) {
  var channel = req.body.channel;
  console.log("Trying to leave channel " + channel + ".");
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
          delete client.channels[channel];
          response.json(body);
        } else if (body.channel_exists && !body.user_in_channel) {
          response.json(body);
        } else if (!body.channel_exists) {
          response.json(body);
        } else {
          response.send("An unhandled error occurred.")
        }
      }
    }
  );
}
var exports = module.exports = {};

var request = require("request");

var client = require("./server.js");

// Requests the directory to create a new channel, and updates the membership list for that channel upon success.
exports.createChannel = function(channel) {
  console.log("Trying to create channel " + channel + ".");
  var promise = new Promise(function(resolve, reject) {
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

            resolve(body.members);
          } else if (body.channel_exists) {
            // If the channel exists already, we're set.
            reject("Channel " + channel + " already exists.");
          } else {
            reject("An unhandled error occurred.");
          }
        } else {
          resolve(exports.createChannel(channel));
        }
      }
    )
  });

  return promise;
}

// Requests the directory to add this user to a channel, and updates the membership list for that channel upon success.
exports.joinChannel = function(channel) {
  console.log("Trying to join channel " + channel + ".");
  var promise = new Promise(function(resolve, reject) {
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

            resolve(body.members);
          } else if (!body.channel_exists) {
            // If the channel didn't exist, we create it.
            resolve(exports.createChannel(channel));
          } else {
            reject("An unhandled error occurred.");
          }
        } else {
          resolve(exports.joinChannel(channel));
        }
      }
    );
  });

  return promise;
}

// Requests the directory to remove this user from a channel, and clears the membership list for that channel upon success.
exports.leaveChannel = function(channel) {
  console.log("Trying to leave channel " + channel + ".");
  var promise = new Promise(function(resolve, reject) {
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
            resolve("Successfully left channel " + channel + ".");
          } else if (body.channel_exists && !body.user_in_channel) {
            reject("User was not a member of channel " + channel + ".");
          } else if (!body.channel_exists) {
            reject("Channel " + channel + " does not exist.");
          } else {
            reject("An unhandled error occurred.")
          }
        }
      }
    );
  });

  return promise;
}
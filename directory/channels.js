var exports = module.exports = {};

channels = {};

// Creates a channel and adds the user to it, returning the membership list.
// If the channel already exists, returns an error.
exports.createChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;
  var address = req.body.address;

  console.log("Received a request from " + user + " to create channel " + channel + ".");

  if (!(channel in channels)) {
    // Create the channel and put the user in its member list
    channels[channel] = {};
    channels[channel][user] = address;
    res.json({ success: true, members: channels[channel] });
  } else {
    res.json({ success: false, channel_exists: true });
  }
}

// Joins an existing channel and returns the membership list.
// If the channel does not exist or the user is already in the channel, returns an error.
exports.joinChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;
  var address = req.body.address;

  console.log("Received a request from " + user + " to join channel " + channel + ".");

  if (channel in channels) {
    // Add the user to the member list of this channel
    channels[channel][user] = address;
    res.json({ success: true, members: channels[channel] });
  } else {
    res.json({ success: false, channel_exists: false });
  }
}

// Leaves a channel, returning an acknowledgement of success.
// If the channel does not exist or the user is not in the channel, returns an error.
exports.leaveChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;
  var userIndex;

  console.log("Received a request from " + user + " to leave channel " + channel + ".");

  if (channel in channels) {
    // Remove the user from the member list of this channel
    if (user in channels[channel]) {
      delete channels[channel][user];
      res.json({ success: true });
    } else {
      res.json({ success: false, channel_exists: true, user_in_channel: false });
    }
  } else {
    res.json({ success: false, channel_exists: false, user_in_channel: false });
  }
}
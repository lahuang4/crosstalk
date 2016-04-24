var exports = module.exports = {};

channels = {};

// Creates a channel and adds the user to it, returning the membership list.
// If the channel already exists, returns an error.
exports.createChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;

  console.log("Received a request to create channel " + channel + ". Does it already exist? " + channel in channels);

  if (!(channel in channels)) {
    // Create the channel and put the user in its member list
    channels[channel] = [user];
    res.json({ members: channels[channel] });
  } else {
    res.json({ error: "Channel " + channel + " already exists." });
  }
}

// Joins an existing channel and returns the membership list.
// If the channel does not exist or the user is already in the channel, returns an error.
exports.joinChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;

  console.log("Received a request to join channel " + channel + ", which has members " + channels[channel] + ".");

  if (channel in channels) {
    // Add the user to the member list of this channel
    console.log("Is user " + user + " already in channel " + channel + "? " + (channels[channel].indexOf(user) != -1));
    if (channels[channel].indexOf(user) == -1) {
      channels[channel].push(user);
      res.json({ members: channels[channel] });    
    } else {
      res.json({ error: "User " + user + " is already in channel " + channel + "." });
    }
  } else {
    res.json({ error: "Channel " + channel + " does not exist." });
  }
}

// Leaves a channel, returning an acknowledgement of success.
// If the channel does not exist or the user is not in the channel, returns an error.
exports.leaveChannel = function(req, res) {
  var channel = req.body.channel;
  var user = req.body.user;
  var userIndex;

  console.log("Received a request to leave channel " + channel + ", which has members " + channels[channel] + ".");

  if (channel in channels) {
    // Remove the user from the member list of this channel
    userIndex = channels[channel].indexOf(user);
    if (userIndex > -1) {
      channels[channel].splice(userIndex, 1);
      res.json({ success: true });
    } else {
      res.json({ error: "User " + user + " was not in channel " + channel + "." });
    }
  } else {
    res.json({ error: "Channel " + channel + " does not exist." });
  }
}
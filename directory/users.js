var exports = module.exports = {};

users = new Set();

// Adds the user to the set of users currently logged in.
exports.login = function(req, res) {
  var username = req.body.username;
  console.log("Received login request from user " + username);
  if (users.has(username)) {
    res.json({ success: false });
  } else {
    users.add(username);
    res.json({ success: true });
  }
}

// Removes the user from the set of users currently logged in.
exports.logout = function(req, res) {
  var username = req.body.username;
  console.log("Received logout request from user " + username);
  users.delete(username);
  res.json({ success: true });
}
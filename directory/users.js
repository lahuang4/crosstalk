var exports = module.exports = {};

users = new Set();

// Adds the user to the set of users currently logged in.
// TODO: Add a way to remove logged in users: users should be able to log out, and usernames should be cached on the client side for people who don't log out.
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
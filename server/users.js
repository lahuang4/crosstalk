var exports = module.exports = {};

var request = require("request");

var client = require("./server.js");

// Logs in a user, if that username is not already taken.
exports.login = function(req, result) {
  console.log("Req is " + JSON.stringify(req.body));
  var username = req.body.username;
  console.log("Attempting to log in user " + username);
  request.post(
    client.directory + "/login",
    {
      json: {
        username: username
      }
    },
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        result.json(body);
      }
    }
  );
}

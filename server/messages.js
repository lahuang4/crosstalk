var exports = module.exports = {};

exports.receiveMessage = function(req, res) {
  var user = req.body.user;
  var msg = req.body.message;
  var log = req.body.log;

  console.log("Log: " + JSON.stringify(log));

  console.log("Received a message from user " + user + ": " + msg);

  res.json({ success: true });
}
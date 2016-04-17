var exports = module.exports = {};

exports.sendMessage = function(request, response) {
  response.end("Hello! Message sent.");
}
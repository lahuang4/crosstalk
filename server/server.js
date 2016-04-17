var messages = require("./messages.js");

var http = require("http");

const PORT = 8080;

// Parse request and call a callback depending on the request
function handleRequest(request, response) {
  // Anti-entropy messaging
  // Hash chat logs to compare them?
	if (request.url == "/sendMessage") {
		messages.sendMessage(request, response);
	} else {
		response.end("Hello! Path hit: " + request.url);
	}
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
	console.log("Server listening on: http://localhost:%s", PORT);
});

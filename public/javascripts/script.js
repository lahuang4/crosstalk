var client = {};

// Refresh the chat log with the latest messages.
function refreshChatLog() {
  // TODO: Acquire the chat log for this channel and update the chat box.
}

// Add a single message to the chat box.
function addMessage(msg) {
  var newDiv = $("<div></div>");
  newDiv.text(msg);
  $("#chat-box")[0].appendChild(newDiv[0]);
}

$(document).ready(function() {
  // We only show the user login initially.
  $("#channel").hide();
  $("#chat-box").hide();
  $("#message").hide();

  $("#user-button").click(function() {
    console.log("Login button clicked.");

    if ($("#user-input").val()) {
      // Check to make sure nobody else has taken this username.
      // TODO: Make a request to the directory checking the username.

      // If we're okay, set our username.
      client.username = $("#user-input").val();

      // If not, we alert the user.
      // TODO: Display a message "This username is already in use."

      // Show the other elements on the page.
      $("#greeting").text("Hello, " + client.username + "!");
      $("#user").hide();
      $("#channel").show();
    }
  });

  $("#channel-button").click(function() {
    console.log("Join channel button clicked.");

    if ($("#channel-input").val()) {
      // Join the channel.
      // TODO: Make a request to the directory to join the channel.
      client.channel = $("#channel-input").val();

      // Show the other elements on the page.
      $("#channel").hide();
      $("#chat-box").show();
      $("#message").show();

      $("#chat-box-header").text("#" + client.channel);

      // Acquire the chat log.
      refreshChatLog();
    }
  });

  $("#message-button").click(function() {
    console.log("Send message button clicked.");

    if ($("#message-input").val()) {
      // Send the message out.
      // TODO: Send the message out to the other peers in the channel.

      addMessage($("#message-input").val());

      // Clear the message from the textbox.
      $("#message-input").val("");
    }
  });
});
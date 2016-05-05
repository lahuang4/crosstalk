var client = {};

var server = "http://localhost:4000";

// Refresh the chat log with the latest messages.
function refreshChatLog() {
  // TODO: Acquire the chat log for this channel and update the chat box.
}

// Add a single message to the chat box.
function addMessage(msg) {
  var newDiv = $("<div></div>");
  newDiv.text(msg);
  $("#chat-box-content")[0].appendChild(newDiv[0]);
  $("#chat-box-content")[0].scrollTop = $("#chat-box-content")[0].scrollHeight;
}

$(document).ready(function() {
  // We only show the user login initially.
  $("#channel").hide();
  $("#chat-box").hide();
  $("#message").hide();

  $("#user-input").keyup(function(event) {
    if(event.keyCode == 13) {
      $("#user-button").click();
    }
  });

  $("#channel-input").keyup(function(event) {
    if(event.keyCode == 13) {
      $("#channel-button").click();
    }
  });

  $("#message-input").keyup(function(event) {
    if(event.keyCode == 13) {
      $("#message-button").click();
    }
  });

  $("#user-button").click(function() {
    console.log("Login button clicked.");

    if ($("#user-input").val()) {
      // Check to make sure nobody else has taken this username.
      $.post(server + "/login",
      {
        username: $("#user-input").val()
      })
      .done(function(data) {
        if (data.success) {
          // We successfully got the username.
          client.username = $("#user-input").val();

          // Show the other elements on the page.
          $("#greeting").text("Hello, " + client.username + "!");
          $("#user").hide();
          $("#channel").show();
        } else {
          alert("Sorry, this username is already in use.");
        }
      });
    }
  });

  $("#channel-button").click(function() {
    console.log("Join channel button clicked.");

    if ($("#channel-input").val()) {
      // Join the channel.
      $.post(server + "/joinChannel",
      {
        username: client.username,
        channel: $("#channel-input").val()
      })
      .done(function(data) {
        console.log("Received response: " + JSON.stringify(data));
        // TODO: use the returned members (display a list of chat members?)

        client.channel = $("#channel-input").val();

        // Show the other elements on the page.
        $("#channel").hide();
        $("#chat-box").show();
        $("#message").show();

        $("#chat-box-header").text("#" + client.channel);

        // Acquire the chat log.
        refreshChatLog();
      });
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
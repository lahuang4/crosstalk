var client = {};

var server = "http://localhost:4000";

// Refresh the chat log with the latest messages.
function refreshChatLog() {
  $.post(server + "/getLog",
  {
    // TODO: Maybe some sort of authorization in the future to make these channels more secure?
    channel: client.channel
  })
  .done(function(data) {
    // Refresh the displayed chat messages.
    client.log = data.log;
    console.log("I got chat log " + JSON.stringify(client.log));
    displayChatLog(client.log);
  });
}

// Display the chat log in the chat box.
function displayChatLog(log) {
  // Clear the messages currently displayed in the chat box.
  $("#chat-box-content").text("");

  // Iterate through the tree and add messages.
  var node = log.root;
  // Iterate down a single path for now...
  // TODO: Display branches side-by-side
  while (node.children.length > 0) {
    node = log.directory[node.children[0]];
    addMessage(node.value);
  }
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

  // Refresh the chat log once in a while to receive new updates if we haven't been sending anything.
  // TODO: Push notifications instead of having to poll for updates?
  setInterval(function() {
    if (client.username && client.channel) {
      refreshChatLog();
    }
  }, 1000);

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
        client.log = data.log;

        // Show the other elements on the page.
        $("#channel").hide();
        $("#chat-box").show();
        $("#message").show();

        $("#chat-box-header").text("#" + client.channel);

        // Display the chat log.
        displayChatLog(client.log);
      });
    }
  });

  $("#leave-channel-button").click(function() {
    console.log("Leave channel button clicked.");

    $.post(server + "/leaveChannel",
    {
      username: client.username,
      channel: client.channel
    })
    .done(function(data) {
      client.channel = "";

      $("#chat-box").hide();
      $("#message").hide();
      $("#channel").show();
    });
  });

  $("#message-button").click(function() {
    console.log("Send message button clicked.");

    if ($("#message-input").val()) {
      // Send the message out.
      $.post(server + "/sendMessage",
      {
        username: client.username,
        msg: $("#message-input").val()
      })
      .done(function(data) {
        console.log("I received a response: \n" + JSON.stringify(data));

        // Display the updated log.
        client.log = data.log;
        displayChatLog(client.log);

        // Clear the message from the textbox.
        $("#message-input").val("");
      });
    }
  });
});
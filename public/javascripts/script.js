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
    if (!equalTrees(client.log, data.log)) {
      client.log = data.log;
      console.log("I got chat log " + JSON.stringify(client.log));
      displayChatLog(client.log);
    }
  });
}

// Display the chat log in the chat box.
function displayChatLog(log) {
  // Clear the messages currently displayed in the chat box.
  $("#chat-box-content").text("");

  console.log("I have the log this " + JSON.stringify(log));

  // Iterate through the tree and add messages.
  var queue = [log.root._id];
  var visited = new Set();
  var rootDiv = $("<div class='message-block'></div>");
  rootDiv.addClass(log.root._id)
    .css("width", "100%");
  $("#chat-box-content").append(rootDiv);

  for (var i=0; i<queue.length; i++) {
    // Put the children in the queue.
    var nodeID = queue[i];
    var node = log.directory[nodeID];

    if (node.children.length > 1) {
      var newRow = $("<div class='message-row'></div>");
      $("." + nodeID).append(newRow);
    }

    node.children.forEach(function(childID) {
      if (!visited.has(childID)) {
        visited.add(childID);
        queue.push(childID);

        var child = log.directory[childID];

        if (child.parents.length === 1) {
          if (node.children.length === 1) {
            // it's a continuation
            var newMessage = $("<span class='message'></span>");
            newMessage.text(child.value);
            $("." + nodeID).append(newMessage)
              .addClass(childID);
          } else {
            // it's a split
            var newMessageBlock = $("<div class='message-block'></div>");
            var newMessage = $("<span class='message'></span>");
            var percentWidth = 100 / node.children.length;
            newMessage.text(child.value);
            newMessageBlock.append(newMessage)
              .addClass(childID)
              .css("width", percentWidth.toString() + "%");

            $("." + nodeID + " > .message-row").last().append(newMessageBlock);
          }
        } else {
          // it's a merge
          var newMessage = $("<span class='message'></span>");
          newMessage.text(child.value);

          for (var i=0; i<child.parents.length; i++) {
            var parentID = child.parents[i];
            if ($("." + parentID).length) {
              $("." + parentID).parents(".message-block").append(newMessage)
              .addClass(childID);
              break;
            }
          }
        }
      }
    });
  }
  // Scroll to the bottom of the chat.
  $("#chat-box-content")[0].scrollTop = $("#chat-box-content")[0].scrollHeight;
}

function equalTrees(tree1, tree2) {
  return JSON.stringify(tree1) === JSON.stringify(tree2);
}

$(document).ready(function() {
  // We only show the user login initially.
  $("#channel").hide();
  $("#chat-box").hide();
  $("#message").hide();
  $("#partition").hide();

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

  $("#partition-input").keyup(function(event) {
    if(event.keyCode == 13) {
      $("#partition-button").click();
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
        $("#partition").show();

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
      $("#partition").hide();
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

  $("#partition-button").click(function() {
    console.log("Partition set!");

    $.post(server + "/setPartition",
    {
      partition: $("#partition-input").val()
    });
  });
});
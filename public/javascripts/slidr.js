var Slidr = {
  socket: null,
  presentationId: null,
  subscriptionId: null
};

Slidr.render = function(id, payload) {
  var template = $(id).html();

  return template.replace(/%\{([a-z0-9_]+)\}/gim, function(match, name){
    var value = payload[name] ? payload[name].toString() : match;
    return $("<span>" + value + "</span>").text();
  });
};

Slidr.Handlers = {};

Slidr.Handlers.online = function(payload) {
  var rendered = Slidr.render("#user-template", {
    gravatar: payload.sender.gravatar,
    name: payload.sender.name
  });

  $("#user-list").append(rendered);
};

Slidr.Handlers.chatMessage = function(payload) {
  console.log("received chat message: ", payload.message);

  var rendered = Slidr.render("#message-template", {
    gravatar: payload.sender.gravatar,
    name: payload.sender.name,
    message: payload.message
  });

  $("#chat-messages").append(rendered);
};

Slidr.send = function(type, payload) {
  payload.type = type;
  payload.subscriptionId = this.subscriptionId;
  payload.presentationId = this.presentationId;

  console.log("send to server: ", payload);

  this.socket.send(JSON.stringify(payload));
};

$(function(){
  var uri = "ws://localhost:" + (parseInt(location.port, 10) + 1) + "/websession";

  Slidr.socket = new WebSocket(uri);

  Slidr.socket.onopen = function(){
    Slidr.send("online", {});
  };

  Slidr.socket.onmessage = function(message) {
    var payload = JSON.parse(message.data)
      , handler = Slidr.Handlers[payload.type]
    ;

    if (handler) {
      handler(payload);
    } else {
      console.log("== Received unknown message from server: ", payload);
    }
  };

  Slidr.socket.onclose = function() {
    console.log("closed connection");
  };

  Slidr.socket.onerror = function(error) {
    console.log(error);
  }

  $("textarea").keyup(function(e){
    if (e.keyCode != 13) {
      return true;
    }

    Slidr.send("chatMessage", {
      message: $(this).val()
    });

    $(this).val("")[0].focus();
    return false;
  });
});
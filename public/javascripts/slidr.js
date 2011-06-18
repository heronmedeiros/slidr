var Slidr = {};
Slidr.socket = null;
Slidr.wsPort = parseInt(location.port, 10) + 1;
Slidr.user = null;

Slidr.appendUser = function(payload) {
  var markup = Slidr.render("user", payload);

  if ($("#user-" + payload.id).length == 0) {
    $("#users").append(markup)
  }
}

Slidr.render = function(templateName, payload) {
  var template = $("#" + templateName + "-template").html();

  return template.replace(/\{\{(.*?)\}\}/gm, function(match, attribute){
    return payload[attribute];
  });
}

Slidr.write = function(message, payload) {
  payload.type = message;
  this.socket.send(JSON.stringify(payload));
}

Slidr.onOpen = function() {
  Slidr.write("connect", Slidr.user);
}

Slidr.onError = function() {
  console.log("== ERRRROR! FUUUUUUUU!");
}

Slidr.onMessage = function(payload) {
  var data = JSON.parse(payload.data)
    , handler = Slidr.Handlers[data.type]
  ;

  if (!handler) {
    return console.log("Invalid message: ", payload);
  }

  handler.call(Slidr, data);
}

Slidr.Handlers = {};

Slidr.Handlers.joined = function(payload) {
  Slidr.appendUser(payload);
}

Slidr.Handlers.userList = function(payload) {
  for (var i in payload.users) {
    Slidr.appendUser(payload.users[i]);
  }
}

Slidr.Handlers.message = function(payload) {
  var markup = Slidr.render("message", {
      gravatar: payload.user.gravatar
    , name: payload.user.name
    , message: $("<span>" + payload.message + "</span>").text()
  });

  $("#messages")
    .append(markup)
    .scrollTop(9999999 * 1000)
  ;
}

$(function(){
  Slidr.socket = new WebSocket("ws://localhost:" + Slidr.wsPort);
  Slidr.socket.onopen = Slidr.onOpen;
  Slidr.socket.onerror = Slidr.onError;
  Slidr.socket.onmessage = Slidr.onMessage;
  Slidr.socket.onclose = Slidr.onClose;

  $("#chat-message").keyup(function(e){
    if (e.keyCode == 13) {
      Slidr.write("message", {message: this.value});
      this.value = "";
      return false;
    };
  });
});

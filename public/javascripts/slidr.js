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

Slidr.Handlers.slideCount = function(payload) {
  var img = new Image();

  for (var i = 1; i <= payload.count; i++) {
    img.src = Slidr.slideBasePath + "/slides" + i + ".png";
  }
}

Slidr.Handlers.joined = function(payload) {
  Slidr.appendUser(payload);
}

Slidr.Handlers.slide = function(payload) {
  $("#slide").attr("src", Slidr.slideBasePath + "/slides" + payload.current + ".png");
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
    , time: new Date().toLocaleTimeString()
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
  Slidr.slideBasePath = "/slides/" + Slidr.user.presentationId;

  $(".users").click(function(){
    $("#message-box").hide();
    $("#users").show();
    $("#tabs a").removeClass("active");
    $(this).addClass("active");

    return false;
  });

  $(".chat").click(function(){
    $("#message-box").show();
    $("#users").hide();
    $("#tabs a").removeClass("active");
    $(this).addClass("active");

    return false;
  });

  $("#chat-message").keyup(function(e){
    if (e.keyCode == 13) {
      Slidr.write("message", {message: this.value});
      this.value = "";
      return false;
    };
  });

  $("#next").click(function(){
    Slidr.write("slide", {direction: "forward"});
    return false;
  });

  $("#prev").click(function(){
    Slidr.write("slide", {direction: "backward"});
    return false;
  });
});

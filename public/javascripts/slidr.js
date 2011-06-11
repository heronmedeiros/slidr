var Slidr = {
  socket: null,
  id: null
};

Slidr.Handlers = {};

Slidr.send = function(type, payload) {
  payload.type = type;
  payload.id = this.id;

  this.socket.send(JSON.stringify(payload));
};


$(function(){
  var uri = "ws://localhost:" + (parseInt(location.port, 10) + 1) + "/websession";

  Slidr.socket = new WebSocket(uri);

  Slidr.socket.onopen = function(){
    console.log("connected")
  };

  Slidr.socket.onmessage = function(message) {
    Slidr.send("hello", {message: "Hello from browser"});
  };

  Slidr.socket.onclose = function() {
    console.log("closed connection");
  };

  Slidr.socket.onerror = function(error) {
    console.log(error);
  }
});
var Handlers = {};

Handlers.connected = function(payload) {
  console.log("== Connected: ", payload);
};

Handlers.hello = function(payload) {
  console.log("== Received a hello message: ", payload.message);
};

Handlers.online = function(payload) {
  payload.emitter.emit("online", payload);
};

Handlers.chatMessage = function(payload) {
  payload.emitter.emit("chatMessage", payload);
};

module.exports = Handlers;

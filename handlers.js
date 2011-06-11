var Handlers = {};

Handlers.connected = function(payload) {
  console.log(payload);
};

Handlers.hello = function(payload) {
  console.log("== Received a hello message: ", payload.message);
};

module.exports = Handlers;

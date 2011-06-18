var Handler = {}
  , models = require("./models")
  , Presentation = models.Presentation
;

Handler.message = function(env, payload) {
  payload.user = env.socket.user;
  env.emit("message", payload);
};

Handler.connect = function(env, payload) {
  Presentation.findById(payload.presentationId, function(err, presentation){
    if (err || !presentation) {
      return env.socket.end();
    }

    var attendee = presentation.attendees.filter(function(item){
      return item.id == payload.id
    })[0];

    if (!attendee) {
      return env.socket.end();
    };

    var user = {
        name: attendee.name
      , gravatar: attendee.gravatarUrl
      , id: payload.id.md5()
    }

    env.socket.user = user;
    env.write(env.socket, "userList", {users: env.users});

    env.users[user.id] = user;
    env.emit("joined", user);
  });
}

module.exports = Handler;

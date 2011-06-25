var Handler = {}
  , models = require("./models")
  , Presentation = models.Presentation
;

Handler.message = function(env, payload) {
  payload.user = env.socket.user;
  env.emit("message", payload);
};

Handler.slide = function(env, payload) {
  var presentationId = env.socket.user.presentationId
    , slides = env.slides[presentationId]
    , changed = false
  ;

  if (payload.direction == "forward" && slides.current < slides.total) {
    slides.current += 1;
    changed = true;
  }

  if (payload.direction == "backward" && slides.current > 1) {
    slides.current -= 1;
    changed = true;
  }

  if (changed) {
    env.emit("slide", slides);
  }
};

var User = function(attendee, payload, presentation){
  this.name = attendee.name;
  this.gravatar = attendee.gravatarUrl;
  this.id = payload.id.md5();
  this.presentationId = presentation.id;
}

var prepareEnv = function(env, presentation, attendee, payload){
  var user = new User(attendee, payload, presentation);
  env.socket.user = user;
  env.write(env.socket, "userList", {users: env.users});
  env.write(env.socket, "slideCount", {count: presentation.slides});
  env.users[user.id] = user;
  env.slides[presentation.id] = {
    total: presentation.slides,
    current: 0
  };
  env.emit("joined", user);
}

Handler.connect = function(env, payload){
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

    prepareEnv(env, presentation, attendee, payload);
  });
}

module.exports = Handler;

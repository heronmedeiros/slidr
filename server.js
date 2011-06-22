var express = require("express")
  , form = require("connect-form")
  , app = express.createServer(form({keepExtensions: true}))
  , exec = require("child_process").exec
  , helper = require("./helper")
  , models = require("./models")
  , Presentation = models.Presentation
  , Attendee = models.Attendee
  , ws = require("./lib/ws")
  , handlers = require("./handlers")
  , emitter = new process.EventEmitter()
  , users = {}
;

function basic_auth(req, res, next) {
  if(req.headers.authorization && req.headers.authorization.search("Basic") == 0) {
    if(new Buffer(req.headers.authorization.split(" ")[1], "base64").toString() == "admin:123") {
      next();
      return;
    }
  }
  
  res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
  
  if(req.headers.authorization) {
    setTimeout(function(){
      res.send("Authentication Required", 401);
    }, 3000);
  } else {
    res.send("Authentication Required", 401);
  }
}

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + "/public"));
});

app.get("/", basic_auth, function(req, res){
  Presentation.find({}, function(err, docs){
    res.render("index.ejs", {layout: "layout/site.ejs", presentations: docs});
  });
});

app.get("/create", basic_auth, function(req, res){
  var presentation = new Presentation();
  presentation.save(function(err){
    if (err) {
      throw err;
    }

    res.redirect("/speaker/" + presentation.id);
  });
});

app.get("/speaker/:id", basic_auth, function(req, res, next){
  Presentation.findById(req.params.id, function(err, presentation){
    if (err || !presentation) { return next(err); }

    res.render("create.ejs", {
      layout: "layout/speaker.ejs",
      params: req.params,
      presentation: presentation
    });
  });
});

app.post("/speaker/:id/upload", basic_auth, function(req, res, next){
  req.form.on("progress", function(received, expected){
    console.log("received: " + received);
    console.log("expected: " + expected);
    console.log((received / expected * 100) + "%");
  });

  req.form.complete(function(err, fields, files){
    if (err) {
      return next(error);
    }

    var destiny = __dirname + "/public/slides/" + req.params.id
      , cmd = [
          "rm -rf " + destiny
        , "mkdir -p " + destiny
        , "gs -q -dNOPAUSE -dBATCH -sDEVICE=pngalpha -sOutputFile=" + destiny + "/slides%d.png " + files.slides.path
        , "ls " + destiny + " | wc -l"
      ].join(" && ")
    ;

    console.log("== command: ", cmd);

    exec(cmd, function(err, stdout, stderr){
      Presentation.findById(req.params.id, function(err, presentation){
        if (err || !presentation) { return next(err); }

        presentation.slides = parseInt(stdout.replace(/[^\d]/g, ""), 10);
        
        presentation.save(function(err){
          if (err) { throw err };
          res.redirect("/speaker/" + presentation.id);
        });
      });
    });
  });
});

app.get("/attend/:presentation_id", function(req, res, next){
  Presentation.findById(req.params.presentation_id, function(err, presentation){
    if (err || !presentation) { return next(err); }

    res.render("attend.ejs", {
      params: req.params,
      layout: "layout/site.ejs"
    });
  });
});

app.post("/attend/:presentation_id", function(req, res, next){
  Presentation.findById(req.params.presentation_id, function(err, presentation){
    if (err || !presentation) { return next(err); }

    var attendee = new Attendee({
        name: req.body.attendee.name
      , email: req.body.attendee.email
    });

    presentation.attendees.push(attendee);

    presentation.save(function(err){
      if (err) { throw err; }
      res.redirect("/attend/" + presentation.id + "/" + attendee._id);
    });
  });
});

app.get("/attend/:presentation_id/:id", function(req, res, next){
  Presentation.findById(req.params.presentation_id, function(err, presentation){
    if (err || !presentation) { return next(err); }

    var attendee = presentation.attendees.filter(function(item){
      return item.id == req.params.id
    })[0];

    if (!attendee) {
      return next();
    };

    res.render("watch.ejs", {
      layout: "layout/site.ejs",
      params: req.params,
      presentation: presentation,
      attendee: attendee
    });
  });
});

appWS = ws.createServer(function (socket) {
  var write = function(websocket, message, payload) {
    payload.type = message;
    websocket.write(JSON.stringify(payload));
  }

  var emitterHandler = function(message, payload) {
    console.log(arguments);
    console.log("== emitting message: ", message);
    write(socket, message, payload);
  }

  var emit = function(message, payload) {
    emitter.emit(message, message, payload);
  }

  emitter.on("joined", emitterHandler);
  emitter.on("message", emitterHandler);

  socket.addListener("connect", function () {
  });

  socket.addListener("data", function (payload) {
    var data = JSON.parse(payload.toString())
      , handler = handlers[data.type]
    ;

    console.log("== user info: ", socket.user);

    if (!handler) {
      return console.log("Invalid message: ", payload);
    }

    var env = {
        emitter: emitter
      , socket: socket
      , emit: emit
      , write: write
      , users: users
    }

    handler.call(this, env, data);
  })

  socket.addListener("close", function () {
    delete(users[socket.user.id]);
  });
})

app.listen(2345);
appWS.listen(2346);
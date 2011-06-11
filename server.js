var express = require("express")
  , form = require("connect-form")
  , ws = require("./lib/ws")
  , app = express.createServer(form({keepExtensions: true}))
  , exec = require("child_process").exec
  , helper = require("./helper")
  , Presentation = require("./models/presentation")
  , handlers = require("./handlers")
  , emitter = new process.EventEmitter()
;

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + "/public"));
});

app.get("/", function(req, res){
  res.render("index.ejs", {layout: "layout/site.ejs"});
});

app.get("/create", function(req, res){
  var presentation = new Presentation();
  res.redirect("/speaker/" + presentation.id);
});

app.get("/speaker/:id", function(req, res, next){
  res.render("create.ejs", {layout: "layout/speaker.ejs", params: req.params, presentation: Presentation.all[req.params.id]});
});

app.get("/speaker/:presentation_id/talk", function(req, res, next){
  res.render("speaker.ejs", {layout: "layout/slides.ejs", params: req.params, presentation: Presentation.all[req.params.presentation_id]});
});

app.post("/speaker/:id/upload", function(req, res, next){
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
      Presentation.all[req.params.id].slides = parseInt(stdout.replace(/[^\d]/g, ""), 10);
      console.log(Presentation.all);
      res.redirect("/speaker/" + req.params.id);
    });

  });
});

app.get("/attend/:presentation_id", function(req, res, next){
  if (!Presentation.all[req.params.presentation_id]) {
    return next();
  };

  res.render("attend.ejs", {params: req.params, layout: "layout/site.ejs"})
});

app.post("/attend/:presentation_id", function(req, res, next){
  var presentation = Presentation.all[req.params.presentation_id];

  if (!presentation) {
    return next();
  };

  var attendee = presentation.createAttendee(req.body.attendee);

  res.redirect("/attend/" + req.params.presentation_id + "/" + attendee.id);
});

app.get("/attend/:presentation_id/:id", function(req, res, next){
  var presentation = Presentation.all[req.params.presentation_id]
    , attendee = presentation.attendees[req.params.id]
  ;

  console.log(presentation);
  console.log(attendee);

  if (!attendee) {
    return next();
  };

  res.render("attendee.ejs", {layout: "layout/slides.ejs", params: req.params, presentation: presentation});
});

ws.createServer(function(websocket){
  var emitterHandler = function(payload) {
    var attendee = payload.presentation.attendees[payload.subscriptionId]
      , copy = {}
    ;

    copy.sender = {
      name: attendee.name,
      gravatar: attendee.gravatarUrl()
    }

    var filter = [
      "presentation",
      "subscrptionId",
      "emitter"
    ];

    for (var name in payload) {
      if (filter.indexOf(name) >= 0) {
        continue;
      }

      copy[name] = payload[name];
    }

    send(websocket, copy);
  };

  var send = function(socket, payload) {
    socket.write(JSON.stringify(payload));
  }

  emitter.on("chatMessage", emitterHandler);
  emitter.on("online", emitterHandler);
  emitter.on("sliderPosition", emitterHandler);

  websocket.addListener("connect", function(){
  });

  websocket.addListener("data", function(data){
    var payload = JSON.parse(data)
      , handler = handlers[payload.type]
    ;

    payload.presentation = Presentation.all[payload.presentationId];
    payload.emitter = emitter;

    if (handler) {
      handler(payload);
    } else {
      console.log("== Unknown message: ", payload);
    }
  });
}).listen(2346)

app.listen(2345);

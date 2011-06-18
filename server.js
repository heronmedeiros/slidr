var express = require("express")
  , form = require("connect-form")
  , app = express.createServer(form({keepExtensions: true}))
  , exec = require("child_process").exec
  , helper = require("./helper")
  , models = require("./models")
  , Presentation = models.Presentation
  , Attendee = models.Attendee
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
  presentation.save(function(err){
    if (err) {
      throw err;
    }

    res.redirect("/speaker/" + presentation.id);
  });
});

app.get("/speaker/:id", function(req, res, next){
  Presentation.findById(req.params.id, function(err, presentation){
    if (err || !presentation) { return next(err); }

    res.render("create.ejs", {
      layout: "layout/speaker.ejs",
      params: req.params,
      presentation: presentation
    });
  });
});

app.post("/speaker/:id/upload", function(req, res, next){
  req.form.on("progress", function(received, expected){
    console.log("received: " + received);
    console.log("expected: " + expected);
    console.log((received / expected * 100) + "%");
  });

  req.form.complete(function(err, fields, files){
    if (err || !presentation) {
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
  Presentation.findById(req.params.presentation_id, function(err, presentation){
    if (err || !presentation) { return next(); }

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

    if (attendee) {
      return next();
    };

    res.send("Welcome!");
  });
});

app.listen(2345);

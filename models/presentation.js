var helper = require("../helper")
  , Attendee = require("./attendee")
  , fs = require("fs")
;

function Presentation() {
  this.id = helper.newId();
  this.attendees = {};

  Presentation.all[this.id] = this;
}

Presentation.prototype.createAttendee = function(arguments) {
  var attendee = new Attendee(arguments);
  this.attendees[attendee.id] = attendee;
  return attendee;
}

// Presentation.prototype.save = function() {
//   Presentation.all[this.id] = this;
//
//   var read = new Buffer(1024)
//     , filepath = __dirname + "/../data.js"
//     , data
//   ;
//
//
// }

Presentation.all = {};

// Presentation.find = function(id, callback) {
//   fs.readFile(filepath, function(err, content){
//     if (err) {
//       throw err;
//     }
//
//     content = content.toString();
//
//     if (content === "") {
//       data = {};
//     } else {
//       JSON.parse(content);
//     }
//
//     callback.call(~data.indexOf(id) ? id : null);
//   });
// }

module.exports = Presentation;

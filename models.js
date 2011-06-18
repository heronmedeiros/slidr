var helper = require("./helper")
  , mongoose = require("mongoose")
  , Schema = mongoose.Schema
;

// Establish connection
mongoose.connect("mongodb://localhost/slidr");

var AttendeeSchema = new Schema({
    name  : String
  , email : {type: String, index: true}
});

AttendeeSchema.virtual("gravatarUrl").get(function(){
    return "http://gravatar.com/avatar/" + this.email.toString().md5() + "?d=mm";
});

mongoose.model("Attendee", AttendeeSchema);

var PresentationSchema = new Schema({
  attendees : [AttendeeSchema]
});

mongoose.model("Presentation", PresentationSchema);

module.exports = {
    Presentation: mongoose.model("Presentation")
  , Attendee: mongoose.model("Attendee")
}

var testCase = require('nodeunit').testCase
  , models = require("../models.js")
;


module.exports['Presentation'] = testCase({
  "Moldel Presentation must have prototype slides": function(test){
     test.ok(models.Presentation.prototype.hasOwnProperty("slides"));
     test.done();
   },

   "Model Presentation must have prototype attendees" : function(test){
     test.ok(models.Presentation.prototype.hasOwnProperty("attendees"));
     test.done();
   }
  
});

module.exports['Atteendee'] = testCase({

  "Model Atteendee must have prototype name" : function(test){
     test.ok(models.Attendee.prototype.hasOwnProperty("name"));
     test.done();
  },

  "Model Atteendee must have prototype email" : function(test){
     test.ok(models.Attendee.prototype.hasOwnProperty("email"));
     test.done();
  },

  "Model Atteendee must have prototype gravatarUrl " : function(test){
     test.ok(models.Attendee.prototype.hasOwnProperty("gravatarUrl"));
     test.done();
  }

});

mongoose = require('mongoose');
module.exports['Mongoose: Atteendee'] = testCase({
  "Mongoose must have model attendees" : function(test){
      test.ok(mongoose.models.hasOwnProperty('attendees'));
    test.done();
  }
});

module.exports['Mongoose: presentation'] = testCase({

  "presentations must be a model" : function(assert){
     var value = mongoose.models.presentations;
     assert.ok(typeof(value), "model" );
     assert.done();
  }
});

module.exports['Mongoose: attendees'] = testCase({

  "attendees must be a model" : function(assert){
     var value = mongoose.models.attendees;
     assert.ok(typeof(value), "model" );
     assert.done();
  }
});

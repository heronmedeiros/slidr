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

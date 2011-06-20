var testCase = require("nodeunit").testCase
  , helper = require("../helper.js") 
;

module.exports = testCase({
  "String must have prototype md5": function(test){
    test.ok(String.prototype.hasOwnProperty("md5"));
    test.done();
  }
});

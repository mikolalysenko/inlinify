var inline = require("../inline")

console.log(inline(
  function(potato) {
    var s = potato + 1
    this.q = "abasdf"
    return s + this.q
  }, "test_", ["a"]
))

console.log(inline(
  function() {
    dumb_label:
      for(var i=0; i<100; ++i) {
        break dumb_label
        continue dumb_label
      }
  }, "scratch", []
))

console.log(inline(
  function() {
    
    console.log(arguments[0])
    
  }, "test", []
))
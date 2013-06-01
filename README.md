inlinify
========
Preprocesses JavaScript functions so that they can be inlined as macros.

Example
=======

```javascript
var inline = require("inlinify")

//Preprocess a function for inlining
var inline_block = inline(
  function(local_arg0, local_arg1) {
    var s = local_arg0 + local_arg1
    this.potato = s
    console.log("s = ", s)
    return s * 10
  }, "inline_prefix_", ["arg0", "arg1"])
  
  
//Retrieve variables
console.log(inline_block.variables)
console.log(inline_block.this_variables)
console.log(inline_block.return_variable)
console.log(body)
```

`require("inlinify")(func, prefix, args)`
-----------------------------------------
Preprocesses func so that it can be inlined into a block of code.

* `func` is the function to inline
* `prefix` is a string which is used to relabel all the variables in func to avoid conflicts
* `args` is the list of arguments for `func`

**Returns** An object with the following properties:

* `variables` a list of the local variables in func
* `this_variables` a list of variables in the `this` object of the func
* `body` an inlinable string representing the body of the function
* `return_variable` the name of the return variable for the function

## Credits
(c) 2013 Mikola Lysenko. MIT License
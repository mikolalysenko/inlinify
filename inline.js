"use strict"

var falafel = require("falafel")

function getArgs(src) {
  var args = []
  falafel(src, function(node) {
    var i
    if(node.type === "FunctionExpression" &&
       node.parent.parent.parent.type === "Program") {
      args = new Array(node.params.length)
      for(i=0; i<node.params.length; ++i) {
        args[i] = node.params[i].name
      }
    }
  })
  return args
}

function isGlobal(identifier) {
  if(typeof(window) !== "undefined") {
    return identifier in window
  } else if(typeof(GLOBAL) !== "undefined") {
    return identifier in GLOBAL
  } else {
    return false
  }
}

function inline(func, inline_prefix, arg_names) {
  var variables = {}
  var this_variables = {}
  var src = "(" + func + ")()"
  var orig_args = getArgs(src)
  var has_return = false
  var result = ""
  var return_variable = "_" + inline_prefix + "return"
  
  falafel(src, function(node) {
    var n, i, j, x
    if(node.type === "FunctionExpression" &&
       node.parent.parent.parent.type === "Program") {
      result = node.body.source()
    } else if(node.type === "Identifier") {
      if(node.parent.type === "MemberExpression") {
        if((node.parent.property === node && !node.parent.computed)) {
          return
        }
      }
      n = node.name
      i = orig_args.indexOf(n)
      if(i >= 0) {
        node.update(arg_names[i])
      } else if(isGlobal(n)) {
        return
      } else if(n in variables) {
        x = inline_prefix + node.source().trim()
        node.update(x)
      } else if(node.parent.type === "VariableDeclarator") {
        x = inline_prefix + node.source().trim()
        variables[n] = x
        node.update(x)
      } else if(node.parent.type === "LabeledStatement" ||
                node.parent.type === "BreakStatement" ||
                node.parent.type === "ContinueStatement" ||
                node.parent.type === "FunctionExpression") {
        node.update(inline_prefix + node.source().trimLeft())
      } else {
        throw new Error("Unbound global or free variable: " + n)
      }
    } else if(node.type === "MemberExpression") {
      if(node.object.type === "ThisExpression") {
        x = "this_" + node.property.source().trim()
        node.update(x)
        this_variables[x] = true
      }
    } else if(node.type === "ReturnStatement") {
      node.update(return_variable+"="+node.argument.source().trim()+"; break __"+inline_prefix+"_return;\n")
      has_return = true
    } else if(node.type === "ThisExpression") {
      if(!(node.parent.type === "MemberExpression" && !node.parent.computed)) {
        throw new Error("Dynamic this can not be inlined")
      }
    } else if(node.type === "VariableDeclaration") {
      if(node.kind === "var") {
        x = []
        for(i=0; i<node.declarations.length; ++i) {
          x.push(node.declarations[i].source())
        }
        node.update(x.join(","))
      }
    }
  })
  
  if(has_return) {
    result = "__" + inline_prefix + "_return: do " + result + " while(0)"
  }
  
  return {
    variables: Object.keys(variables).map(function(s) { return inline_prefix + s }),
    this_variables: Object.keys(this_variables),
    return_variable: return_variable,
    body: result
  }
}

module.exports = inline
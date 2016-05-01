var Node = require("../models/node.js");

var assert = function(bool, msg) {
  if (!bool) {
    throw msg;
  }
}

var TestAddParent = function() {
  var a = new Node();
  var b = new Node();

  a.addParent(b);

  assert(a.parents.has(b._id), "a's parents do not include b's ID");
  assert(b.children.has(a._id), "b's children do not include a's ID");
}

var TestAddChild = function() {
  var a = new Node();
  var b = new Node();

  a.addChild(b);

  assert(a.children.has(b._id), "a's children do not include b's ID");
  assert(b.parents.has(a._id), "b's parents do not include a's ID");
}

var TestEquality = function() {
  var a = new Node();
  var b = a.clone();

  assert(a.equals(b), "a does not equal b");

  var c = new Node();
  a.addParent(c);
  b.addParent(c);

  assert(a.equals(b), "a does not equal b");

  var d = new Node();
  a.addChild(d);
  b.addChild(d);

  assert(a.equals(b), "a does not equal b");
}

var TestInequality = function() {
  var a = new Node();
  var b = a.clone();

  assert(a.equals(b), "a does not equal b");

  var c = new Node();
  a.addParent(c);

  assert(!a.equals(b), "a equals b");

  var d = new Node();
  b.addParent(c);
  b.addChild(d);

  assert(!a.equals(b), "a equals b");

  var e = new Node();
  a.addChild(e);

  assert(!a.equals(b), "a equals b");

  var f = new Node()
  var g = new Node("a");

  assert(!f.equals(g), "f equals g");
}

TestAddParent();
TestAddChild();
TestEquality();
TestInequality();

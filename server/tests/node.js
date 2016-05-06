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

  assert(a.parents.indexOf(b._id) > -1, "a's parents do not include b's ID");
  assert(b.children.indexOf(a._id) > -1, "b's children do not include a's ID");
}

var TestAddChild = function() {
  var a = new Node();
  var b = new Node();

  a.addChild(b);

  assert(a.children.indexOf(b._id) > -1, "a's children do not include b's ID");
  assert(b.parents.indexOf(a._id) > -1, "b's parents do not include a's ID");
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

  assert(a.hashCode() === b.hashCode(), "a's hashcode does not equal b's hashcode");

  var c = new Node();
  a.addParent(c);

  assert(!a.equals(b), "a equals b");
  assert(a.hashCode() !== b.hashCode(), "a's hashcode equals b's hashcode");

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

var Node = require("../models/node.js");
var Tree = require("../models/tree.js");

var assert = function(bool, msg) {
  if (!bool) {
    throw msg;
  }
}

var TestSmallSubtree = function() {
  var tree1 = new Tree();
  var tree2 = new Tree();

  assert(tree1.hashCode() === tree2.hashCode(), "hash codes are not equal");

  var a = new Node("a");
  var b = new Node("b");
  var c = new Node("c");

  var aCopy = a.clone();
  var bCopy = b.clone();

  // a -> b -> c
  tree1.root.addChild(a);
  a.addChild(b);
  b.addChild(c);
  tree1.directory[a._id] = a;
  tree1.directory[b._id] = b;
  tree1.directory[c._id] = c;
  tree1.leaves.splice(tree1.leaves.indexOf(tree1.root._id), 1);
  tree1.leaves.push(c._id);

  // a -> b
  tree2.root.addChild(aCopy);
  aCopy.addChild(bCopy);
  tree2.directory[a._id] = a;
  tree2.directory[b._id] = b;
  tree2.leaves.splice(tree2.leaves.indexOf(tree2.root._id), 1);
  tree2.leaves.push(b._id);

  tree2.merge(tree1);

  assert(tree1.hashCode() === tree2.hashCode(), "hash codes are not equal");

  assert(tree1.directory[b._id].equals(tree2.directory[bCopy._id]), "node b not equal");

  var bCopyChildren = Array.from(tree2.directory[bCopy._id].children);
  assert(bCopyChildren.length != 0, "bCopy does not have the right number of children");
  assert(tree2.directory[bCopyChildren[0]].equals(c), "node c not equal");

  console.log("Passed");
}

var TestSimple = function() {
  var tree1 = new Tree();
  var tree2 = tree1.clone();

  var a = new Node("a");
  tree1.root.addChild(a);
  tree1.directory[a._id] = a;
  tree1.leaves.splice(tree1.leaves.indexOf(tree1.root._id), 1);
  tree1.leaves.push(a._id);

  tree2.merge(tree1);

  console.log(JSON.parse(JSON.stringify(tree1)));

  console.log("Passed");
}

// TestSmallSubtree();
TestSimple();


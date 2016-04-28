var _ = require("lodash");
var Node = require("./node.js");

var Tree = function() {
  var tree = Object.create(Tree.prototype);

  tree.root = new Node(); // initialize a dummy root node
  tree.leaves = new Set();
  tree.leaves.add(tree.root);
  tree.directory = {};
  tree.directory[tree.root._id] = tree.root;
  tree.versions = {};

  tree.merge = function(peerTree) {
    if (!(peerTree instanceof Tree)) {
      throw "Unexpected peerTree type: " + peerTree.constructor.name;
    }

    // compute which nodes this tree is missing
    var missingNodes = {};
    for (var server in peerTree.versions) {
      // compare peer's version to my version
      if (server in tree.versions) {
        if (tree.versions[server] < peerTree.versions[server]) {
          missingNodes[server] = {
            min: tree.versions[server] + 1,
            max: peerTree.versions[server]
          }
        }
      } 
      // I don't have any messages from the server
      else {
        missingNodes[server] = {
          min: 1,
          max: peerTree.versions[server]
        }
      }
    }

    // start at the peer tree's leaves and traverse up until you find 

  }

  // TODO: finish implementation
  tree.equals = function(otherTree) {
    if (!tree.root.equals(otherTree.root)) {
      return false;
    }

    return _.isEqual(tree.versions, otherTree.versions);
  }

  return tree;
}

Tree()

module.exports = Tree;
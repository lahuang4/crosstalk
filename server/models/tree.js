var _ = require("lodash");
var Node = require("./node.js");

var Tree = function() {
  var tree = Object.create(Tree.prototype);

  tree.root = new Node(); // initialize a dummy root node
  tree.leaves = new Set();
  tree.leaves.add(tree.root._id);
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

    var isMissing = function(sender, version) {
      return sender in missingNodes && version >= missingNodes[sender];
    }

    // start at the peer tree's leaves and traverse up until you find a node that exists in my tree
    var nodesToProcess = [];

    peerTree.leaves.forEach(function(leafID) {
      if (!(leafID in tree.directory)) {
        var copiedNode = peerTree.directory[leafID].clone();
        tree.directory[leafID] = copiedNode;
        nodesToProcess.push(leafID);
      }
      tree.leaves.add(leafID);
    });

    for (var i=0; i<nodesToProcess.length; i++) {
      var nodeID = nodesToProcess[i];
      peerTree.directory[nodeID].parents.forEach(function(parentID) {
        if (!(parentID in tree.directory)) {
          var copiedNode = peerTree.directory[parentID].clone();
          tree.directory[parentID] = copiedNode;
          nodesToProcess.push(parentID)
        }
        tree.directory[nodeID].addParent(tree.directory[parentID]);
        tree.leaves.delete(parentID);
      });
    }

    // update the version vector
    for (var server in peerTree.versions) {
      tree.versions[server] = Math.max(tree.versions[server], peerTree.versions[server]);
    }
  }

  tree.equals = function(otherTree) {
    if (!tree.root.equals(otherTree.root)) {
      return false;
    }

    return _.isEqual(tree.versions, otherTree.versions);
  }

  tree.clone = function() {
    var newTree = new Tree();
    newTree.directory[tree.root._id] = newTree.root;
    delete newTree.directory[newTree.root._id];
    newTree.root._id = tree.root._id;

    return newTree;
  }

  return tree;
}

Tree()

module.exports = Tree;
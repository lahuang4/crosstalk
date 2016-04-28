var shortid = require("shortid");
var _ = require("lodash");

var Node = function(value) {
  var node = Object.create(Node.prototype);
  
  node._id = shortid.generate();
  node.parents = new Set();
  node.children = new Set();
  node.value = value || "";

  // add a parent node to this node
  node.addParent = function(parentNode) {
    if (!(parentNode instanceof Node)) {
      throw "Unexpected parentNode type: " + parentNode.constructor.name;
    }

    if (!node.parents.has(parentNode)) {
      node.parents.add(parentNode);
      parentNode.addChild(node);
    }
  }

  // add a child node for this node
  node.addChild = function(childNode) {
    if (!(childNode instanceof Node)) {
      throw "Unexpected childNode type: " + childNode.constructor.name;
    }

    if (!node.children.has(childNode)) {
      node.children.add(childNode);
      childNode.addParent(node);
    }
  }

  // copy this node's id and value
  node.clone = function() {
    var clone = new Node(node.value);
    clone._id = node._id;

    return clone;
  }

  // check if two nodes are equivalent (same id, value, parent IDs, and children IDs)
  node.equals = function(otherNode) {
    if (!(otherNode instanceof Node)) {
      return false;
    }

    if (node._id !== otherNode._id) {
      return false;
    }

    var childrenIDs = new Set();
    var otherChildrenIDs = new Set();
    node.children.forEach(function(child) {
      childrenIDs.add(child._id);
    });
    otherNode.children.forEach(function(child) {
      otherChildrenIDs.add(child._id);
    });

    if (!_.isEqual(childrenIDs, otherChildrenIDs)) {
      return false;
    }

    var parentIDs = new Set();
    var otherParentIDs = new Set();
    node.parents.forEach(function(parent) {
      parentIDs.add(parent._id);
    });
    otherNode.parents.forEach(function(parent) {
      otherParentIDs.add(parent._id);
    });

    if (!_.isEqual(parentIDs, otherParentIDs)) {
      return false;
    }

    return true;
  }

  return node;
}

module.exports = Node;
var shortid = require("shortid");
var _ = require("lodash");

var Node = function(value) {
  var node = Object.create(Node.prototype);
  
  node._id = shortid.generate();
  node.parents = new Set();
  node.children = new Set();
  node.value = value || "root";

  // add a parent node to this node
  node.addParent = function(parentNode) {
    if (!(parentNode instanceof Node)) {
      throw "Unexpected parentNode type: " + parentNode.constructor.name;
    }

    if (!node.parents.has(parentNode._id)) {
      node.parents.add(parentNode._id);
      parentNode.addChild(node);
    }
  }

  // add a child node for this node
  node.addChild = function(childNode) {
    if (!(childNode instanceof Node)) {
      throw "Unexpected childNode type: " + childNode.constructor.name;
    }

    if (!node.children.has(childNode._id)) {
      node.children.add(childNode._id);
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

    return node._id === otherNode._id &&
      _.isEqual(node.children, otherNode.children) &&
      _.isEqual(node.parents, otherNode.parents);
  }

  return node;
}

module.exports = Node;
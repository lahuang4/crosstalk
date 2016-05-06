var shortid = require("shortid");
var _ = require("lodash");

String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

var Node = function(value, obj) {
  var node = Object.create(Node.prototype);
  
  node._id = shortid.generate();
  node.parents = [];
  node.children = [];
  node.value = value || "root";

  if (obj) {
    for (var prop in obj) {
      node[prop] = obj[prop];
    }
  }

  // add a parent node to this node
  node.addParent = function(parentNode) {
    if (!(parentNode instanceof Node)) {
      throw "Unexpected parentNode type: " + parentNode.constructor.name;
    }

    if (node.parents.indexOf(parentNode._id) === -1) {
      node.parents.push(parentNode._id);
      parentNode.addChild(node);
    }
  }

  // add a child node for this node
  node.addChild = function(childNode) {
    if (!(childNode instanceof Node)) {
      throw "Unexpected childNode type: " + childNode.constructor.name;
    }

    if (node.children.indexOf(childNode._id) === -1) {
      node.children.push(childNode._id);
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
      _.isEqual(new Set(node.children), new Set(otherNode.children)) &&
      _.isEqual(new Set(node.parents), new Set(otherNode.parents));
  }

  node.hashCode = function() {
    return node._id.hashCode() + node.parents.map(function(parentID) {
      return parentID.hashCode()
    }).reduce(function(prevValue, curValue) {
      return prevValue + curValue;
    },0) + node.children.map(function(childID) {
      return childID.hashCode()
    }).reduce(function(prevValue, curValue) {
      return prevValue + curValue;
    },0) + node.value.hashCode();
  }

  return node;
}

module.exports = Node;
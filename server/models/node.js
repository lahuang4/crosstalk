var shortid = require("shortid");

var Node = function(value) {
  var node = Object.create(Node.prototype);
  
  node._id = shortid.generate();
  node.parents = new Set();
  node.children = new Set();
  node.value = value

  node.addParent = function(parentNode) {
    if (!(parentNode instanceof Node)) {
      throw "Unexpected parentNode type: " + parentNode.constructor.name;
    }

    if (!node.parents.has(parentNode)) {
      node.parents.add(parentNode);
      parentNode.addChild(node);
    }
  }

  node.addChild = function(childNode) {
    if (!(childNode instanceof Node)) {
      throw "Unexpected childNode type: " + childNode.constructor.name;
    }

    if (!node.children.has(childNode)) {
      node.children.add(childNode);
      childNode.addParent(node);
    }
  }

  return node;
}

module.exports = Node;
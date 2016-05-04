var exports = module.exports = {};

var Tree = require("../server/models/tree.js");

// Client information
exports.username = "user1";
exports.address = "http://localhost:4000";
exports.channels = {};
exports.directory = "http://localhost:3000";
exports.log = new Tree();
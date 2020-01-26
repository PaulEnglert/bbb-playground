require("babel-register");

const hardware = require("./hardware");
const server = require("./server");
require("./api").serve(server, hardware);
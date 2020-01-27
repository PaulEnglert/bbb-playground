require("babel-register");
require("babel-polyfill");
/**
 * Setup App
 *
 * -> import hardware configs
 * -> import server configs
 * -> create bbManager
 *
 */
const hardware = require("./hardware");
const server = require("./server");
const bbmanager = require("./bbmanager");
require("./api").serve(bbmanager.bbManager({syncronized: true}), server, hardware);
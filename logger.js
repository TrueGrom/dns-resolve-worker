const bunyan = require("bunyan");
const config = require("./config");

const log = bunyan.createLogger({
  name: config.workerName,
  workerId: config.workerId
});

module.exports = log;

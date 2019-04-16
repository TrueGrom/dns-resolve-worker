const uuid4 = require("uuid/v4");

const config = {};

config.workerName = process.env.WORKER_NAME || `dns-worker`;
config.workerId = uuid4();
config.restartDuration = parseInt(process.env.RESTART_DURATON, 10) || 1000;

config.rabbit = {};
config.rabbit.url = process.env.RABBIT_URL;
config.rabbit.receiveQueue = process.env.RABBIT_RECEIVE_QUEUE;
config.rabbit.resultQueue = `${config.rabbit.receiveQueue}-result`;

module.exports = config;

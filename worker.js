const amqp = require("amqplib");
const logger = require("./logger");
const DnsResolver = require("./dns-resolver");
const { DNS_SERVERS } = require("./constants");
const {
  restartDuration,
  rabbit: { url, resultQueue, receiveQueue }
} = require("./config");

let replyProducerChannel;

const resolver = new DnsResolver(DNS_SERVERS);

function normalizeContent(content) {
  return {
    ...content,
    hostname: content.hostname.toLowerCase(),
    type: content.type.toUpperCase()
  };
}

function validateContent(content) {
  const { type, hostname } = content;
  if (!type) {
    logger.error({ content }, "no record type");
    return false;
  }
  if (!hostname) {
    logger.error({ content }, "no hostname");
    return false;
  }
  if (!DnsResolver.hasRecord(type)) {
    logger.error({ content }, "invalid record type");
    return false;
  }
  return true;
}

function handleMessage(channel) {
  return async message => {
    try {
      const content = JSON.parse(message.content);
      if (validateContent(content)) {
        const { type, hostname } = normalizeContent(content);
        const result = await resolver.resolveByType(type, hostname);
        replyProducerChannel.sendToQueue(
          resultQueue,
          Buffer.from(JSON.stringify(result)),
          { persistent: true }
        );
        channel.ack(message);
      } else {
        channel.ack(message);
      }
    } catch (e) {
      if (e.code === "ENOTFOUND") {
        logger.error({ message }, e);
        channel.ack(message);
      }
      if (e.name === "SyntaxError") {
        logger.error({ message }, "invalid JSON");
        channel.ack(message);
      } else {
        logger.error({ message }, e);
        channel.reject(message, false);
      }
    }
  };
}

async function prepareConsumer(connection) {
  const channel = await connection.createChannel();
  channel.on("close", event => logger.warn(event));
  channel.on("error", error => logger.error(error));
  channel.assertQueue(receiveQueue, { durable: true });
  channel.prefetch(1);
  return channel.consume(receiveQueue, handleMessage(channel));
}

async function prepareReplyProducer(connection) {
  replyProducerChannel = await connection.createChannel();
  replyProducerChannel.on("close", event => logger.warn(event));
  replyProducerChannel.on("error", error => logger.error(error));
  return replyProducerChannel.assertQueue(resultQueue, { durable: true });
}

function restart() {
  return setTimeout(() => connect(), restartDuration);
}

async function connect() {
  try {
    const connection = await amqp.connect(url);
    logger.info("connected");
    connection.on("close", event => {
      logger.error(event);
      restart();
    });
    connection.on("error", error => {
      logger.error(error);
      connection.close();
      restart();
    });
    await prepareReplyProducer(connection);
    await prepareConsumer(connection);
  } catch (e) {
    logger.error(e);
    restart();
  }
}

(async () => {
  try {
    await connect();
  } catch (e) {
    logger.fatal(e);
    process.exit(1);
  }
})();

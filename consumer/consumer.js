const { Kafka } = require("kafkajs");
const log4js = require("log4js");

log4js.configure({
  appenders: { out: { type: "stdout", layout: { type: "json" } } },
  categories: { default: { appenders: ["out"], level: "info" } }
});

const logger = log4js.getLogger();

const kafka = new Kafka({ brokers: ["kafka:9092"] });
const consumer = kafka.consumer({ groupId: "cdc-group" });

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "tidb-cdc", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      logger.info(JSON.parse(message.value.toString()));
    }
  });
})();

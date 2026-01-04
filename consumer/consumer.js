const kafka = require('kafka-node');
const log4js = require('log4js');

// Configure log4js
log4js.configure({
  appenders: { out: { type: "stdout" } },
  categories: { default: { appenders: ["out"], level: "info" } }
});
const logger = log4js.getLogger('consumer');

// Kafka setup
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const consumer = new Consumer(
  client,
  [{ topic: 'tidb-cdc', partition: 0 }],
  { autoCommit: true }
);

// Consume messages
consumer.on('message', function(message) {
  logger.info({
    timestamp: new Date().toISOString(),
    action: 'db_change',
    message: message.value
  });
});

consumer.on('error', function(err) {
  logger.error({ timestamp: new Date().toISOString(), error: err });
});

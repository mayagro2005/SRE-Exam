const kafka = require('kafka-node');
const log4js = require('log4js');

// Configure log4js
log4js.configure({
  appenders: { out: { type: "stdout" } },
  categories: { default: { appenders: ["out"], level: "info" } }
});
const logger = log4js.getLogger('consumer');

// Wait until topic exists
async function waitForTopic(client, topic) {
  return new Promise((resolve) => {
    const check = () => {
      client.loadMetadataForTopics([topic], (err, resp) => {
        if (!err && resp) {
          logger.info({
            timestamp: new Date().toISOString(),
            action: 'topic_ready',
            topic
          });
          return resolve();
        }

        logger.info({
          timestamp: new Date().toISOString(),
          action: 'waiting_for_topic',
          topic
        });

        setTimeout(check, 2000);
      });
    };

    check();
  });
}

async function startConsumer() {
  const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });

  // Wait until TiCDC creates the topic
  await waitForTopic(client, 'tidb-cdc');

  const Consumer = kafka.Consumer;
  const consumer = new Consumer(
    client,
    [{ topic: 'tidb-cdc', partition: 0 }],
    { autoCommit: true }
  );

  consumer.on('message', function (message) {
    logger.info({
      timestamp: new Date().toISOString(),
      action: 'db_change',
      message: message.value
    });
  });

  consumer.on('error', function (err) {
    logger.error({
      timestamp: new Date().toISOString(),
      error: err.toString()
    });
  });
}

startConsumer().catch(err => {
  logger.error({
    timestamp: new Date().toISOString(),
    error: err.toString()
  });
});

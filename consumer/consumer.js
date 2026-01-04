const { Kafka } = require('kafkajs');
const log4js = require('log4js');

// Configure log4js
log4js.configure({
  appenders: { out: { type: "stdout" } },
  categories: { default: { appenders: ["out"], level: "info" } }
});
const logger = log4js.getLogger('consumer');

async function waitForTopic(kafka, topic) {
  const admin = kafka.admin();
  await admin.connect();

  while (true) {
    const topics = await admin.listTopics();
    if (topics.includes(topic)) {
      logger.info({
        timestamp: new Date().toISOString(),
        action: 'topic_ready',
        topic
      });
      await admin.disconnect();
      return;
    }

    logger.info({
      timestamp: new Date().toISOString(),
      action: 'waiting_for_topic',
      topic
    });

    await new Promise(res => setTimeout(res, 2000));
  }
}

async function start() {
  const kafka = new Kafka({
    clientId: 'cdc-consumer',
    brokers: ['kafka:9092']
  });

  const topic = 'tidb-cdc';

  // Wait until topic exists
  await waitForTopic(kafka, topic);

  const consumer = kafka.consumer({ groupId: 'cdc-group' });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      logger.info({
        timestamp: new Date().toISOString(),
        action: 'db_change',
        message: message.value.toString()
      });
    }
  });
}

start().catch(err => {
  logger.error({
    timestamp: new Date().toISOString(),
    error: err.toString()
  });
});

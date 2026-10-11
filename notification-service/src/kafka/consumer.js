const { Kafka } = require("kafkajs");
const config = require("../config");
const { handleEvent } = require("../services/notificationService");

const TOPICS = [
  "payment.created",
  "payment.completed",
  "payment.failed",
  "payment.refunded",
];

function createConsumer() {
  const kafka = new Kafka({
    clientId: "notification-service",
    brokers: config.kafka.brokers,
    retry: {
      retries: 5,
      initialRetryTime: 1000,
    },
  });

  return kafka.consumer({ groupId: config.kafka.groupId });
}

async function startConsumer() {
  const consumer = createConsumer();

  await consumer.connect();
  console.log("Kafka consumer connected");

  await consumer.subscribe({
    topics: TOPICS,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        console.log(`Received event: ${event.event_type} for payment ${event.data.payment_id}`);

        await handleEvent(event);
      } catch (error) {
        console.error(`Failed to process message on ${topic}:`, error.message);
      }
    },
  });

  return consumer;
}

async function startConsumerWithRetry() {
  while (true) {
    try {
      return await startConsumer();
    } catch (error) {
      console.warn(`Kafka not available, retrying in 5s: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

module.exports = { startConsumerWithRetry };

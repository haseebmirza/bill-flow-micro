const { startServer } = require("./server");
const { startConsumerWithRetry } = require("./kafka/consumer");

async function main() {
  console.log("Starting Notification Service...");

  await startServer();

  startConsumerWithRetry().catch((error) => {
    console.error("Kafka consumer fatal error:", error.message);
  });
}

main();

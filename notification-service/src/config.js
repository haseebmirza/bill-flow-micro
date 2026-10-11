require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT || "8003", 10),

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    groupId: process.env.KAFKA_GROUP_ID || "notification-service",
  },

  email: {
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "1025", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "billing@billflow.dev",
  },
};

import { paymentApi, invoiceApi, notificationApi } from "./client";

export async function checkAllServices() {
  const services = [
    { name: "Payment API", client: paymentApi },
    { name: "Invoice Service", client: invoiceApi },
    { name: "Notification Service", client: notificationApi },
  ];

  const results = await Promise.allSettled(
    services.map(({ name, client }) =>
      client
        .get("/health", { timeout: 3000 })
        .then(() => ({ name, status: "ok" }))
        .catch(() => ({ name, status: "down" }))
    )
  );

  return results.map((r) => r.value);
}

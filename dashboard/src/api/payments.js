import { paymentApi } from "./client";

export function getPayments() {
  return paymentApi.get("/payments");
}

export function getPayment(uuid) {
  return paymentApi.get(`/payments/${uuid}`);
}

export function createPayment(data) {
  return paymentApi.post("/payments", data);
}

export function refundPayment(uuid) {
  return paymentApi.post(`/payments/${uuid}/refund`);
}

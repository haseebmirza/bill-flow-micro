import axios from "axios";

const paymentApi = axios.create({
  baseURL: "http://localhost:8001/api",
  headers: { Accept: "application/json" },
});

const invoiceApi = axios.create({
  baseURL: "http://localhost:8002/api",
  headers: { Accept: "application/json" },
});

const notificationApi = axios.create({
  baseURL: "http://localhost:8003/api",
  headers: { Accept: "application/json" },
});

export { paymentApi, invoiceApi, notificationApi };

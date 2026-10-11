import { invoiceApi } from "./client";

export function getInvoices(page = 1) {
  return invoiceApi.get("/invoices", { params: { page } });
}

export function getInvoice(id) {
  return invoiceApi.get(`/invoices/${id}`);
}

export function downloadInvoicePdf(id) {
  return invoiceApi.get(`/invoices/${id}/pdf`, { responseType: "blob" });
}

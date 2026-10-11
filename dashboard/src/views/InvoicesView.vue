<script setup>
import { ref, onMounted } from "vue";
import { getInvoices, downloadInvoicePdf } from "../api/invoices";

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await getInvoices();
    invoices.value = response.data.data;
  } catch (e) {
    error.value = "Failed to load invoices. Is the Invoice Service running?";
  } finally {
    loading.value = false;
  }
});

function formatAmount(cents, currency) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

async function handleDownloadPdf(invoice) {
  try {
    const response = await downloadInvoicePdf(invoice.id);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoice_number}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Failed to download PDF.");
  }
}

const statusColors = {
  generated: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Invoices</h1>

    <p v-if="loading" class="text-gray-500">Loading invoices...</p>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
    >
      {{ error }}
    </div>

    <div
      v-else-if="invoices.length === 0"
      class="bg-white border border-gray-200 p-8 rounded-lg text-center text-gray-500"
    >
      No invoices yet. Invoices are generated automatically when payments complete.
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Invoice #</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Tax</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Total</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-medium text-gray-900">
              {{ invoice.invoice_number }}
            </td>
            <td class="px-4 py-3">
              <div class="text-gray-900">{{ invoice.customer_name }}</div>
              <div class="text-gray-500 text-xs">{{ invoice.customer_email }}</div>
            </td>
            <td class="px-4 py-3 text-gray-700">
              {{ formatAmount(invoice.amount, invoice.currency) }}
            </td>
            <td class="px-4 py-3 text-gray-700">
              {{ formatAmount(invoice.tax_amount, invoice.currency) }}
            </td>
            <td class="px-4 py-3 font-medium text-gray-900">
              {{ formatAmount(invoice.total, invoice.currency) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs font-semibold px-2 py-1 rounded"
                :class="statusColors[invoice.status] || 'bg-gray-100 text-gray-700'"
              >
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ new Date(invoice.issued_at).toLocaleDateString() }}
            </td>
            <td class="px-4 py-3">
              <button
                v-if="invoice.status === 'generated'"
                @click="handleDownloadPdf(invoice)"
                class="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

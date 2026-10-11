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
  generated: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};
</script>

<template>
  <div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Auto-generated invoices from completed payments</p>

    <p v-if="loading" class="text-gray-500 dark:text-gray-400">Loading invoices...</p>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl"
    >
      {{ error }}
    </div>

    <div
      v-else-if="invoices.length === 0"
      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-12 rounded-xl text-center"
    >
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-1">No invoices yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">Invoices are generated automatically when payments complete</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-colors">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Invoice #</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Customer</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Amount</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Tax</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Total</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Status</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Date</th>
            <th class="px-5 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <td class="px-5 py-4 font-medium text-gray-900 dark:text-white">
              {{ invoice.invoice_number }}
            </td>
            <td class="px-5 py-4">
              <div class="text-gray-900 dark:text-white">{{ invoice.customer_name }}</div>
              <div class="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{{ invoice.customer_email }}</div>
            </td>
            <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
              {{ formatAmount(invoice.amount, invoice.currency) }}
            </td>
            <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
              {{ formatAmount(invoice.tax_amount, invoice.currency) }}
            </td>
            <td class="px-5 py-4 font-semibold text-gray-900 dark:text-white">
              {{ formatAmount(invoice.total, invoice.currency) }}
            </td>
            <td class="px-5 py-4">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="statusColors[invoice.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-5 py-4 text-gray-400 dark:text-gray-500">
              {{ new Date(invoice.issued_at).toLocaleDateString() }}
            </td>
            <td class="px-5 py-4">
              <button
                v-if="invoice.status === 'generated'"
                @click="handleDownloadPdf(invoice)"
                class="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

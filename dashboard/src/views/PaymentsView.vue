<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { getPayments, simulateWebhook, refundPayment } from "../api/payments";

const payments = ref([]);
const loading = ref(true);
const error = ref(null);

async function loadPayments() {
  try {
    const response = await getPayments();
    payments.value = response.data.data;
  } catch (e) {
    error.value = "Failed to load payments. Is the Payment API running?";
  } finally {
    loading.value = false;
  }
}

onMounted(loadPayments);

function formatAmount(cents, currency) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

async function handleComplete(payment) {
  try {
    await simulateWebhook(payment.uuid, "completed");
    payment.status = "completed";
  } catch (e) {
    alert("Failed to complete payment.");
  }
}

async function handleRefund(payment) {
  try {
    await refundPayment(payment.uuid);
    payment.status = "refunded";
  } catch (e) {
    alert("Failed to refund payment.");
  }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Manage and track all payment transactions</p>
      </div>
      <RouterLink
        to="/payments/create"
        class="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Payment
      </RouterLink>
    </div>

    <p v-if="loading" class="text-gray-500 dark:text-gray-400">Loading payments...</p>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl"
    >
      {{ error }}
    </div>

    <div
      v-else-if="payments.length === 0"
      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-12 rounded-xl text-center"
    >
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-1">No payments yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">Create your first payment to get started</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-colors">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Customer</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Amount</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Status</th>
            <th class="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Date</th>
            <th class="px-5 py-3.5 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in payments"
            :key="payment.uuid"
            class="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <td class="px-5 py-4">
              <div class="font-medium text-gray-900 dark:text-white">{{ payment.customer_name }}</div>
              <div class="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{{ payment.customer_email }}</div>
            </td>
            <td class="px-5 py-4 font-semibold text-gray-900 dark:text-white">
              {{ formatAmount(payment.amount, payment.currency) }}
            </td>
            <td class="px-5 py-4">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="statusColors[payment.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ payment.status }}
              </span>
            </td>
            <td class="px-5 py-4 text-gray-400 dark:text-gray-500">
              {{ new Date(payment.created_at).toLocaleDateString() }}
            </td>
            <td class="px-5 py-4 text-right">
              <button
                v-if="payment.status === 'pending'"
                @click="handleComplete(payment)"
                class="text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Complete
              </button>
              <button
                v-if="payment.status === 'completed'"
                @click="handleRefund(payment)"
                class="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Refund
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { getPayments } from "../api/payments";

const payments = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await getPayments();
    payments.value = response.data.data;
  } catch (e) {
    error.value = "Failed to load payments. Is the Payment API running?";
  } finally {
    loading.value = false;
  }
});

function formatAmount(cents, currency) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Payments</h1>
      <RouterLink
        to="/payments/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        New Payment
      </RouterLink>
    </div>

    <p v-if="loading" class="text-gray-500">Loading payments...</p>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
    >
      {{ error }}
    </div>

    <div
      v-else-if="payments.length === 0"
      class="bg-white border border-gray-200 p-8 rounded-lg text-center text-gray-500"
    >
      No payments yet. Create your first payment.
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in payments"
            :key="payment.uuid"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{{ payment.customer_name }}</div>
              <div class="text-gray-500 text-xs">{{ payment.customer_email }}</div>
            </td>
            <td class="px-4 py-3 font-medium text-gray-900">
              {{ formatAmount(payment.amount, payment.currency) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs font-semibold px-2 py-1 rounded"
                :class="statusColors[payment.status] || 'bg-gray-100 text-gray-700'"
              >
                {{ payment.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ new Date(payment.created_at).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

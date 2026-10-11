<script setup>
import { ref, onMounted, computed } from "vue";
import { Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getPayments } from "../api/payments";
import { getInvoices } from "../api/invoices";

ChartJS.register(ArcElement, Tooltip, Legend);

const payments = ref([]);
const invoices = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [payRes, invRes] = await Promise.allSettled([
      getPayments(),
      getInvoices(),
    ]);
    if (payRes.status === "fulfilled") payments.value = payRes.value.data.data;
    if (invRes.status === "fulfilled") invoices.value = invRes.value.data.data;
  } finally {
    loading.value = false;
  }
});

const totalRevenue = computed(() => {
  return payments.value
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
});

const statusCounts = computed(() => {
  const counts = { pending: 0, completed: 0, failed: 0, refunded: 0 };
  payments.value.forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status]++;
  });
  return counts;
});

const chartData = computed(() => ({
  labels: ["Pending", "Completed", "Failed", "Refunded"],
  datasets: [
    {
      data: [
        statusCounts.value.pending,
        statusCounts.value.completed,
        statusCounts.value.failed,
        statusCounts.value.refunded,
      ],
      backgroundColor: ["#fbbf24", "#34d399", "#f87171", "#9ca3af"],
      borderWidth: 0,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { padding: 16, usePointStyle: true, pointStyle: "circle", color: "#9ca3af" },
    },
  },
  cutout: "70%",
};

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

const recentPayments = computed(() => payments.value.slice(0, 5));

const stats = computed(() => [
  {
    label: "Total Payments",
    value: payments.value.length,
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    label: "Completed",
    value: statusCounts.value.completed,
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },
  {
    label: "Total Invoices",
    value: invoices.value.length,
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
  {
    label: "Revenue",
    value: formatCurrency(totalRevenue.value),
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
]);
</script>

<template>
  <div>
    <div v-if="loading" class="text-gray-500 dark:text-gray-400">Loading dashboard...</div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg" :class="stat.color">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" :d="stat.icon" />
              </svg>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment Status</h3>
          <div class="h-64">
            <Doughnut
              v-if="payments.length > 0"
              :data="chartData"
              :options="chartOptions"
            />
            <p v-else class="text-gray-400 dark:text-gray-500 text-sm text-center pt-20">No payment data yet</p>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Payments</h3>
            <RouterLink to="/payments" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              View All
            </RouterLink>
          </div>

          <div v-if="recentPayments.length === 0" class="text-gray-400 dark:text-gray-500 text-sm text-center py-10">
            No payments yet
          </div>

          <table v-else class="w-full text-sm">
            <thead>
              <tr class="text-gray-400 dark:text-gray-500 text-xs uppercase">
                <th class="text-left pb-3 font-medium">Customer</th>
                <th class="text-left pb-3 font-medium">Amount</th>
                <th class="text-left pb-3 font-medium">Status</th>
                <th class="text-left pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in recentPayments"
                :key="payment.uuid"
                class="border-t border-gray-100 dark:border-gray-800"
              >
                <td class="py-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ payment.customer_name }}</div>
                  <div class="text-gray-400 dark:text-gray-500 text-xs">{{ payment.customer_email }}</div>
                </td>
                <td class="py-3 font-medium text-gray-900 dark:text-white">
                  {{ (payment.amount / 100).toFixed(2) }} {{ payment.currency }}
                </td>
                <td class="py-3">
                  <span
                    class="text-xs font-semibold px-2 py-1 rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400': payment.status === 'pending',
                      'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400': payment.status === 'completed',
                      'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400': payment.status === 'failed',
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300': payment.status === 'refunded',
                    }"
                  >
                    {{ payment.status }}
                  </span>
                </td>
                <td class="py-3 text-gray-400 dark:text-gray-500">
                  {{ new Date(payment.created_at).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

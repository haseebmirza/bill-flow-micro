<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createPayment } from "../api/payments";

const router = useRouter();

const form = ref({
  customer_name: "",
  customer_email: "",
  amount: "",
  currency: "USD",
});

const submitting = ref(false);
const errors = ref({});

async function handleSubmit() {
  errors.value = {};
  submitting.value = true;

  try {
    await createPayment({
      ...form.value,
      amount: Math.round(parseFloat(form.value.amount) * 100),
    });

    router.push({ name: "payments" });
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors || {};
    } else {
      errors.value = { general: ["Failed to create payment. Is the Payment API running?"] };
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="max-w-lg">
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter payment details to create a new transaction</p>

    <div
      v-if="errors.general"
      class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-4"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5 transition-colors">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Customer Name</label>
        <input
          v-model="form.customer_name"
          type="text"
          required
          placeholder="John Doe"
          class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
        />
        <p v-if="errors.customer_name" class="text-red-600 dark:text-red-400 text-xs mt-1">
          {{ errors.customer_name[0] }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Customer Email</label>
        <input
          v-model="form.customer_email"
          type="email"
          required
          placeholder="john@example.com"
          class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
        />
        <p v-if="errors.customer_email" class="text-red-600 dark:text-red-400 text-xs mt-1">
          {{ errors.customer_email[0] }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
          <input
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="49.99"
            class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
          />
          <p v-if="errors.amount" class="text-red-600 dark:text-red-400 text-xs mt-1">
            {{ errors.amount[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
          <select
            v-model="form.currency"
            class="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="submitting"
          class="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ submitting ? "Creating..." : "Create Payment" }}
        </button>
        <button
          type="button"
          @click="router.push({ name: 'payments' })"
          class="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

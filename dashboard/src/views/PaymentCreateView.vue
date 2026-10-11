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
    <h1 class="text-2xl font-bold text-gray-900 mb-6">New Payment</h1>

    <div
      v-if="errors.general"
      class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
        <input
          v-model="form.customer_name"
          type="text"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p v-if="errors.customer_name" class="text-red-600 text-xs mt-1">
          {{ errors.customer_name[0] }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
        <input
          v-model="form.customer_email"
          type="email"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p v-if="errors.customer_email" class="text-red-600 text-xs mt-1">
          {{ errors.customer_email[0] }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="49.99"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.amount" class="text-red-600 text-xs mt-1">
            {{ errors.amount[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            v-model="form.currency"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? "Creating..." : "Create Payment" }}
        </button>
        <button
          type="button"
          @click="router.push({ name: 'payments' })"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

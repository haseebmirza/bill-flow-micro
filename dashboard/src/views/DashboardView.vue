<script setup>
import { ref, onMounted } from "vue";
import { checkAllServices } from "../api/health";

const services = ref([]);
const loading = ref(true);

onMounted(async () => {
  services.value = await checkAllServices();
  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Service Health</h2>

      <p v-if="loading" class="text-gray-500">Checking services...</p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="service in services"
          :key="service.name"
          class="flex items-center justify-between p-4 rounded-lg border"
          :class="
            service.status === 'ok'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          "
        >
          <span class="font-medium text-gray-700">{{ service.name }}</span>
          <span
            class="text-sm font-semibold px-2 py-1 rounded"
            :class="
              service.status === 'ok'
                ? 'text-green-700 bg-green-100'
                : 'text-red-700 bg-red-100'
            "
          >
            {{ service.status === "ok" ? "Online" : "Offline" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

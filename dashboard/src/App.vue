<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-8">
            <RouterLink to="/" class="text-xl font-bold text-gray-900">
              BillFlow
            </RouterLink>

            <div class="flex gap-4">
              <RouterLink
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                active-class="!text-blue-600 !bg-blue-50"
              >
                Dashboard
              </RouterLink>
              <RouterLink
                to="/payments"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                active-class="!text-blue-600 !bg-blue-50"
              >
                Payments
              </RouterLink>
              <RouterLink
                to="/invoices"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                active-class="!text-blue-600 !bg-blue-50"
              >
                Invoices
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { checkAllServices } from "./api/health";

const route = useRoute();
const services = ref([]);
const isDark = ref(false);

onMounted(async () => {
  const saved = localStorage.getItem("billflow-theme");
  if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  }
  services.value = await checkAllServices();
});

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("billflow-theme", isDark.value ? "dark" : "light");
}

const navItems = [
  { to: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { to: "/payments", label: "Payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { to: "/invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const onlineCount = () => services.value.filter((s) => s.status === "ok").length;
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors">
    <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full transition-colors">
      <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#863bff"/>
          </svg>
          <div>
            <h1 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">BillFlow</h1>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">Microservices Billing</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="
            (item.to === '/' ? route.path === '/' : route.path.startsWith(item.to))
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          "
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-2">Services</div>
        <div class="space-y-1.5">
          <div
            v-for="service in services"
            :key="service.name"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-gray-600 dark:text-gray-400">{{ service.name }}</span>
            <span
              class="flex items-center gap-1"
              :class="service.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="service.status === 'ok' ? 'bg-green-500' : 'bg-red-400'"></span>
              {{ service.status === "ok" ? "Online" : "Offline" }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 ml-64">
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-between transition-colors">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ route.meta.title || "Dashboard" }}
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs px-2.5 py-1 rounded-full font-medium"
            :class="onlineCount() === 3
              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'"
          >
            {{ onlineCount() }}/3 Services Online
          </span>
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </button>
        </div>
      </header>

      <main class="p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

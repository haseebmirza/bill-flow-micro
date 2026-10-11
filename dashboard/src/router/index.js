import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
  },
  {
    path: "/payments",
    name: "payments",
    component: () => import("../views/PaymentsView.vue"),
  },
  {
    path: "/payments/create",
    name: "payment-create",
    component: () => import("../views/PaymentCreateView.vue"),
  },
  {
    path: "/invoices",
    name: "invoices",
    component: () => import("../views/InvoicesView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "Dashboard" },
  },
  {
    path: "/payments",
    name: "payments",
    component: () => import("../views/PaymentsView.vue"),
    meta: { title: "Payments" },
  },
  {
    path: "/payments/create",
    name: "payment-create",
    component: () => import("../views/PaymentCreateView.vue"),
    meta: { title: "New Payment" },
  },
  {
    path: "/invoices",
    name: "invoices",
    component: () => import("../views/InvoicesView.vue"),
    meta: { title: "Invoices" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

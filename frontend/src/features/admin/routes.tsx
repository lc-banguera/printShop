import React from "react";
import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/features/admin/AdminLayout";

// Import screen components
import Dashboard from "@/features/admin/dashboard";
import Stores from "@/features/admin/stores";
import Users from "@/features/admin/users";
import Subscriptions from "@/features/admin/subscriptions";
import Plans from "@/features/admin/plans";
import Orders from "@/features/admin/orders";
import Products from "@/features/admin/products";
import Designs from "@/features/admin/designs";
import DesignDetail from "@/features/admin/design-detail";
import Templates from "@/features/admin/templates";
import Reports from "@/features/admin/reports";
import Finances from "@/features/admin/finances";
import Payments from "@/features/admin/payments";
import Commissions from "@/features/admin/commissions";
import Marketing from "@/features/admin/marketing";
import Support from "@/features/admin/support";
import Settings from "@/features/admin/settings";
import SystemLogs from "@/features/admin/system-logs";

export const AdminRoutes: React.FC = () => (
  <Routes>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="stores" element={<Stores />} />
      <Route path="users" element={<Users />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="plans" element={<Plans />} />
      <Route path="orders" element={<Orders />} />
      <Route path="products" element={<Products />} />
      <Route path="designs" element={<Designs />} />
      <Route path="designs/:id" element={<DesignDetail />} />
      <Route path="templates" element={<Templates />} />
      <Route path="reports" element={<Reports />} />
      <Route path="finances" element={<Finances />} />
      <Route path="payments" element={<Payments />} />
      <Route path="commissions" element={<Commissions />} />
      <Route path="marketing" element={<Marketing />} />
      <Route path="support" element={<Support />} />
      <Route path="settings" element={<Settings />} />
      <Route path="system-logs" element={<SystemLogs />} />
    </Route>
  </Routes>
);

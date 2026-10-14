import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getAuthorizedStore,
  hasActiveSellerMembership,
  useAuthStore,
} from "@/features/auth";
import { PrepressDtfDesigner } from "../easy";

export function DesignerStoreAccessGuard({
  children,
  fallback = "/workspace",
}: {
  children: ReactNode;
  fallback?: string;
}) {
  const location = useLocation();
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasActiveSellerMembership(auth.user)) {
    return <Navigate to="/plans" replace state={{ from: location }} />;
  }

  if (!getAuthorizedStore(auth.user, auth.activeStoreId)) {
    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export function DesignerPrepressDtfEntry() {
  return <PrepressDtfDesigner />;
}

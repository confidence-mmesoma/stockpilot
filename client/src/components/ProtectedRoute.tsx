import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/context";
import type { Role } from "../types";
import { Spinner } from "./Spinner";

// Wraps pages that need a login (and optionally a specific role)
export function ProtectedRoute({ role }: { role?: Role }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Checking your login..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}

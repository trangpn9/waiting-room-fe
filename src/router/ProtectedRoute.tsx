import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, allowedRoles }: {
  children: JSX.Element,
  allowedRoles: string[],
}) {
  const { token, role } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(role!)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
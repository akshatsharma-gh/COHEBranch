import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "@/lib/api";

export default function ProtectedRoute({ children }) {
  if (!authStore.token) return <Navigate to="/login" replace />;
  return children;
}

"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireInstructor = false,
  redirectTo = "/login",
}) => {
  const { user, profile, loading, isAdmin, isInstructor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // If admin access is required but user is not admin
    if (requireAdmin && !isAdmin()) {
      router.push("/dashboard");
      return;
    }

    // If instructor access is required but user is not instructor
    if (requireInstructor && !isInstructor()) {
      router.push("/dashboard");
      return;
    }
  }, [
    user,
    profile,
    loading,
    requireAuth,
    requireAdmin,
    requireInstructor,
    router,
    redirectTo,
    isAdmin,
    isInstructor,
  ]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return null;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return null;
  }

  // If instructor access is required but user is not instructor
  if (requireInstructor && !isInstructor()) {
    return null;
  }

  return children;
};

// Convenience components for different protection levels
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requireAuth requireAdmin>
    {children}
  </ProtectedRoute>
);

export const InstructorRoute = ({ children }) => (
  <ProtectedRoute requireAuth requireInstructor>
    {children}
  </ProtectedRoute>
);

export const AuthRoute = ({ children }) => (
  <ProtectedRoute requireAuth>{children}</ProtectedRoute>
);

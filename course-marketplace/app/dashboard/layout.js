"use client";

import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div>
        {children}
        {/* Add padding at the bottom to account for mobile navigation */}
        <div className="h-16 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
}

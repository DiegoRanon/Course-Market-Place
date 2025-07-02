"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthProvider";

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and is not admin, redirect to home
    if (!loading && user && profile?.role !== "admin") {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || profile?.role !== "admin") {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
        </div>
        <nav className="px-4 py-6 space-y-1">
          <SidebarLink href="/admin" exact>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/admin/users">
            Users
          </SidebarLink>
          <SidebarLink href="/admin/courses">
            Courses
          </SidebarLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.first_name} {profile?.last_name}
            </span>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
              {profile?.first_name?.[0] || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, children, exact }) {
  const router = useRouter();
  const isActive = exact 
    ? router.pathname === href 
    : router.pathname?.startsWith(href);

  return (
    <Link 
      href={href}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
} 
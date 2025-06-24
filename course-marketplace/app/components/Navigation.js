"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const { user, profile, loading, signOut } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Close dropdown when pressing escape key
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Get display name for the user
  const getDisplayName = () => {
    if (!user) return "";

    if (profile) {
      if (profile.full_name) return profile.full_name;
      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      }
      if (profile.first_name) return profile.first_name;
    }

    return user.email;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              CourseMarket
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/courses"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4 ml-6 lg:ml-8">
            {loading ? (
              // Loading state
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              // Authenticated user - Profile dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-3 py-2"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{getDisplayName()}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getDisplayName()}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      {/* Navigation Links */}
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>

                      {/* Role-specific links */}
                      {profile?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}

                      {(profile?.role === "instructor" ||
                        profile?.role === "admin") && (
                        <Link
                          href="/admin/courses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Courses
                        </Link>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not authenticated - Login/Signup buttons
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

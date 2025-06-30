"use client";

import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/Sidebar";

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    bio: "Software engineer and lifelong learner.",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to update user profile
    console.log("Updating profile with:", formData);
    setIsEditing(false);
    // Show success message
    alert("Profile updated successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Account Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - visible on large screens */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Profile Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {formData.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {formData.fullName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Bio
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formData.bio}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Change Password
              </h2>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation - visible only on small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 lg:hidden z-50">
        <div className="flex justify-around">
          <a
            href="/dashboard"
            className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400"
          >
            <span className="text-xl">📚</span>
            <span className="text-xs mt-1">Courses</span>
          </a>
          <a
            href="/dashboard/progress"
            className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Progress</span>
          </a>
          <a
            href="/dashboard/account"
            className="flex flex-col items-center py-2 px-3 text-blue-500 dark:text-blue-400"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Account</span>
          </a>
        </div>
      </div>
    </div>
  );
}

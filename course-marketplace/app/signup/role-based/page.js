"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Browse, purchase, and view courses.",
  },
  {
    value: "instructor",
    label: "Instructor",
    description: "Upload, manage, and edit content.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full control over content, users, analytics, etc.",
  },
];

export default function RoleBasedSignUp() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value)
          ? ""
          : "Please enter a valid email address";
      case "password":
        if (!value) return "Password is required";
        return value.length >= 6
          ? ""
          : "Password must be at least 6 characters long";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        return value === formData.password ? "" : "Passwords do not match";
      case "role":
        return value ? "" : "Please select a role";
      case "agreeTerms":
        return value ? "" : "You must agree to the terms and conditions";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear success/error messages when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    const error = validateField(name, fieldValue);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    } else if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const userData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        role: formData.role,
      };
      await signUp(formData.email, formData.password, userData);
      router.push("/auth/confirm");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message || "An error occurred during signup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === formData.role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Message Display */}
          {message.text && (
            <div
              className={`rounded-md p-4 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="First name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                  }
                />
                {errors.firstName && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    id="firstName-error"
                  >
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Last name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={
                    errors.lastName ? "lastName-error" : undefined
                  }
                />
                {errors.lastName && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    id="lastName-error"
                  >
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                  id="email-error"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {errors.password && (
                <p
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                  id="password-error"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                  id="confirmPassword-error"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.role ? "border-red-300" : "border-gray-300"
                }`}
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? "role-error" : undefined}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                  id="role-error"
                >
                  {errors.role}
                </p>
              )}
              {/* Role Descriptions */}
              <div className="mt-2 space-y-1">
                {ROLE_OPTIONS.map((role) => (
                  <div key={role.value} className="text-xs text-gray-500">
                    <span className="font-semibold">{role.label}:</span>{" "}
                    {role.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="agreeTerms"
              className="ml-2 block text-sm text-gray-900"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-red-600" role="alert">
              {errors.agreeTerms}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

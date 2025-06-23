"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EmailConfirmation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    confirmationCode: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showResendForm, setShowResendForm] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Check for token in URL on component mount
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      confirmEmailWithToken(token);
    }
  }, [searchParams]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const validateField = (name, value) => {
    switch (name) {
      case "confirmationCode":
        if (!value.trim()) return "Confirmation code is required";
        if (!/^\d{6}$/.test(value.trim()))
          return "Please enter a valid 6-digit confirmation code";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value)
          ? ""
          : "Please enter a valid email address";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    const { name, value } = e.target;
    const error = validateField(name, value);
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

  const confirmEmailWithToken = async (token) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: "Email confirmed successfully!",
        });
        setIsConfirmed(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Invalid or expired confirmation token",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async (e) => {
    e.preventDefault();

    const error = validateField("confirmationCode", formData.confirmationCode);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        confirmationCode: error,
      }));
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: formData.confirmationCode.trim(),
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: "Email confirmed successfully!",
        });
        setIsConfirmed(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Invalid confirmation code",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (e) => {
    e.preventDefault();

    const error = validateField("email", formData.email);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        email: error,
      }));
      return;
    }

    setIsResending(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: "Confirmation code sent successfully!",
        });
        setShowResendForm(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to send confirmation code",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Confirmed!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {showResendForm
                ? "Resend Confirmation Code"
                : "Confirm your email address"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {showResendForm
                ? "Enter your email address to receive a new confirmation code"
                : "Please enter the confirmation code sent to your email"}
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`rounded-md p-4 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {showResendForm ? (
            // Resend Form
            <form className="mt-8 space-y-6" onSubmit={handleResendCode}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
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
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResendForm(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back to confirmation
                </button>
                <button
                  type="submit"
                  disabled={isResending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Sending..." : "Send Code"}
                </button>
              </div>
            </form>
          ) : (
            // Confirmation Form
            <form className="mt-8 space-y-6" onSubmit={handleConfirmEmail}>
              <div>
                <label
                  htmlFor="confirmationCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmation Code
                </label>
                <input
                  id="confirmationCode"
                  name="confirmationCode"
                  type="text"
                  autoComplete="one-time-code"
                  value={formData.confirmationCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    errors.confirmationCode
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                {errors.confirmationCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmationCode}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Confirming..." : "Confirm Email"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResendForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend confirmation code
                </button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

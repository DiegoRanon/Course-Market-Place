"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EmailConfirmation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Check for token in URL on component mount
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      confirmEmailWithToken(token);
    } else {
      // If no token, show the confirmation message directly
      setIsConfirmed(true);
    }
  }, [searchParams]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

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
          text: "Email confirmed successfully! Your account is now active and ready to use.",
        });
        setIsConfirmed(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (message.type === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Confirmation Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {message.text}
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Please confirm your email address
          </h2>
          <div className="mt-8 space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in to your account
            </Link>
            <div>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

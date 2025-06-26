"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter } from "next/navigation";
import TextField from "@/app/components/ui/TextField";
import Button from "@/app/components/ui/Button";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  // Note: Admin accounts are created directly in the database
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const validateField = (name, value) => {
    console.log("validateField", name, value);
    if (name === "email") {
      if (!value || !value.trim()) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (formError) setFormError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
    else if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password);
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    setFormSubmitted(true);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorsObj = validateForm();
    console.log("validateForm errors:", errorsObj);
    if (errorsObj.email || errorsObj.password) return;
    setIsLoading(true);
    setFormError("");
    try {
      await signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {
      setFormError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setFormError("");
    try {
      await signIn(provider);
    } catch (error) {
      setFormError(error.message || "Social login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
            {" | "}
            <a
              href="/signup/creator"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              become a creator
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 p-2 text-center">
              {formError}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? errors.email : ""}
              required
              autoComplete="email"
              placeholder="Email address"
            />
            
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={touched.password && errors.password ? errors.password : ""}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              variant="primary"
              className="w-full"
            >
              Sign in
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Sign in with Google
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Sign in with GitHub
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

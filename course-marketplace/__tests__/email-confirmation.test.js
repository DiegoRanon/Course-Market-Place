import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import EmailConfirmation from "@/app/auth/confirm/page";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("Email Confirmation Page", () => {
  const mockSignIn = jest.fn();
  const mockUser = null;
  const mockLoading = false;
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      loading: mockLoading,
      signIn: mockSignIn,
    });

    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    // Mock useSearchParams to return empty by default
    useSearchParams.mockReturnValue(new URLSearchParams());

    mockSignIn.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();

    // Reset fetch mock
    global.fetch = jest.fn();
  });

  describe("Rendering", () => {
    test("renders email confirmation form", () => {
      render(<EmailConfirmation />);

      expect(
        screen.getByText("Confirm your email address")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please enter the confirmation code sent to your email"
        )
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Confirmation Code")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm Email" })
      ).toBeInTheDocument();
      expect(screen.getByText("Resend confirmation code")).toBeInTheDocument();
    });

    test("renders loading state when page is loading", () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: true,
        signIn: mockSignIn,
      });

      render(<EmailConfirmation />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("redirects to dashboard if user is already authenticated", () => {
      useAuth.mockReturnValue({
        user: { id: "123", email: "test@example.com" },
        loading: false,
        signIn: mockSignIn,
      });

      render(<EmailConfirmation />);

      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Token from URL", () => {
    test("auto-confirms when valid token is in URL", async () => {
      const mockSearchParams = new URLSearchParams("?token=valid-token");
      useSearchParams.mockReturnValue(mockSearchParams);

      // Mock successful confirmation
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<EmailConfirmation />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Email Confirmed!" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Redirecting you to login...")
        ).toBeInTheDocument();
      });
    });

    test("shows error when invalid token is in URL", async () => {
      const mockSearchParams = new URLSearchParams("?token=invalid-token");
      useSearchParams.mockReturnValue(mockSearchParams);

      // Mock failed confirmation
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid or expired token" }),
      });

      render(<EmailConfirmation />);

      await waitFor(() => {
        // Accept either the exact error or a substring
        expect(
          screen.getByText(
            (text) =>
              text.toLowerCase().includes("invalid") ||
              text.toLowerCase().includes("expired")
          )
        ).toBeInTheDocument();
      });
    });

    test("shows error when token confirmation fails", async () => {
      const mockSearchParams = new URLSearchParams("?token=valid-token");
      useSearchParams.mockReturnValue(mockSearchParams);

      // Mock network error
      global.fetch.mockRejectedValue(new Error("Network error"));

      render(<EmailConfirmation />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Network error. Please check your connection and try again."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Manual Code Entry", () => {
    test("shows validation error for empty confirmation code", async () => {
      render(<EmailConfirmation />);

      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Confirmation code is required")
        ).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid confirmation code format", async () => {
      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      fireEvent.change(codeInput, { target: { value: "123" } });
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid 6-digit confirmation code")
        ).toBeInTheDocument();
      });
    });

    test("submits confirmation code successfully", async () => {
      // Mock successful confirmation
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Email Confirmed!" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Redirecting you to login...")
        ).toBeInTheDocument();
      });
    });

    test("shows error when confirmation code submission fails", async () => {
      // Mock failed confirmation
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid confirmation code" }),
      });

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Invalid confirmation code")
        ).toBeInTheDocument();
      });
    });

    test("shows loading state during confirmation", async () => {
      // Mock delayed response
      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              100
            )
          )
      );

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Confirming...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Resend Confirmation", () => {
    test("shows resend confirmation form when clicked", () => {
      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      expect(screen.getByText("Resend Confirmation Code")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send Code" })
      ).toBeInTheDocument();
    });

    test("shows validation error for empty email in resend form", async () => {
      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const sendButton = screen.getByRole("button", { name: "Send Code" });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid email in resend form", async () => {
      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const emailInput = screen.getByLabelText("Email Address");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    test("successfully resends confirmation code", async () => {
      // Mock successful resend
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const emailInput = screen.getByLabelText("Email Address");
      const sendButton = screen.getByRole("button", { name: "Send Code" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText("Confirmation code sent successfully!")
        ).toBeInTheDocument();
      });
    });

    test("shows error when resend fails", async () => {
      // Mock failed resend
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Email not found" }),
      });

      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const emailInput = screen.getByLabelText("Email Address");
      const sendButton = screen.getByRole("button", { name: "Send Code" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Email not found")).toBeInTheDocument();
      });
    });

    test("shows loading state during resend", async () => {
      // Mock delayed response
      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              100
            )
          )
      );

      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const emailInput = screen.getByLabelText("Email Address");
      const sendButton = screen.getByRole("button", { name: "Send Code" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Sending...")).toBeInTheDocument();
        expect(sendButton).toBeDisabled();
      });
    });
  });

  describe("Navigation", () => {
    test("redirects to login page after successful confirmation", async () => {
      // Mock successful confirmation
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Email Confirmed!" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Redirecting you to login...")
        ).toBeInTheDocument();
      });

      // Wait for redirect
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith("/login");
        },
        { timeout: 3000 }
      );
    });

    test("navigates back to main confirmation form from resend form", () => {
      render(<EmailConfirmation />);

      const resendButton = screen.getByText("Resend confirmation code");
      fireEvent.click(resendButton);

      const backButton = screen.getByText("Back to confirmation");
      fireEvent.click(backButton);

      expect(
        screen.getByText("Confirm your email address")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Resend Confirmation Code")
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("handles network errors gracefully", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Network error. Please check your connection and try again."
          )
        ).toBeInTheDocument();
      });
    });

    test("handles malformed JSON responses", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      render(<EmailConfirmation />);

      const codeInput = screen.getByLabelText("Confirmation Code");
      const submitButton = screen.getByRole("button", {
        name: "Confirm Email",
      });

      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText((text) =>
            text.toLowerCase().includes("unexpected error")
          )
        ).toBeInTheDocument();
      });
    });
  });
});

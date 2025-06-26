import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import SignUp from "@/app/signup/page";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

describe("SignUp Page", () => {
  const mockSignUp = jest.fn();
  const mockSignIn = jest.fn();
  const mockUser = null;
  const mockLoading = false;

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      loading: mockLoading,
      signUp: mockSignUp,
      signIn: mockSignIn,
    });
    mockSignUp.mockClear();
    mockSignIn.mockClear();
    mockPush.mockClear();
  });

  describe("Rendering", () => {
    test("renders signup form with all required fields", () => {
      render(<SignUp />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create Account" })
      ).toBeInTheDocument();
    });

    test("renders social login options", () => {
      render(<SignUp />);

      expect(screen.getByText("Or continue with")).toBeInTheDocument();
      expect(screen.getByText("Google")).toBeInTheDocument();
      expect(screen.getByText("GitHub")).toBeInTheDocument();
    });

    test("renders terms and privacy policy links", () => {
      render(<SignUp />);

      expect(screen.getByText(/I agree to the/)).toBeInTheDocument();
      expect(screen.getByText("Terms of Service")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows validation errors for empty required fields", async () => {
      render(<SignUp />);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid email format", async () => {
      render(<SignUp />);

      const emailInput = screen.getByLabelText("Email address");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    test("shows validation error for password mismatch", async () => {
      render(<SignUp />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password456" },
      });
      fireEvent.blur(confirmPasswordInput);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    test("shows validation error for weak password", async () => {
      render(<SignUp />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "123" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 6 characters long")
        ).toBeInTheDocument();
      });
    });

    test("shows validation error when terms are not agreed to", async () => {
      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("You must agree to the terms and conditions")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    test("calls signUp with correct data when form is valid", async () => {
      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          "john@example.com",
          "password123",
          {
            first_name: "John",
            last_name: "Doe",
            full_name: "John Doe",
          }
        );
      });
    });

    test("shows loading state during submission", async () => {
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Creating account...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    test("redirects to confirmation page on successful signup", async () => {
      mockSignUp.mockResolvedValue({ user: { id: "123" } });

      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/auth/confirm");
      });
    });

    test("shows error message on signup failure", async () => {
      const errorMessage = "Email already exists";
      mockSignUp.mockRejectedValue(new Error(errorMessage));

      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe("User Experience", () => {
    test("redirects to login page when user clicks sign in link", () => {
      render(<SignUp />);

      const signInLink = screen.getByText("sign in to your existing account");
      expect(signInLink).toHaveAttribute("href", "/login");
    });

    test("has link to admin signup page", () => {
      render(<SignUp />);

      const adminSignupLink = screen.getByText("Create an admin account");
      expect(adminSignupLink).toHaveAttribute("href", "/signup/admin");
    });

    test("clears form errors when user starts typing", async () => {
      render(<SignUp />);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText("First Name");
      fireEvent.change(firstNameInput, { target: { value: "John" } });

      await waitFor(() => {
        expect(
          screen.queryByText("First name is required")
        ).not.toBeInTheDocument();
      });
    });

    test("prevents form submission when terms are not agreed to", async () => {
      render(<SignUp />);

      // Fill in all required fields but don't check terms
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });
  });
});

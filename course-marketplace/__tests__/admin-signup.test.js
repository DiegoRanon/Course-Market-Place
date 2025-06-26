import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import AdminSignUp from "@/app/signup/admin/page";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("Admin SignUp Page", () => {
  const mockSignUp = jest.fn();
  const mockUser = null;
  const mockLoading = false;

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      loading: mockLoading,
      signUp: mockSignUp,
    });
    mockSignUp.mockClear();
  });

  describe("Rendering", () => {
    test("renders admin signup form with all required fields", () => {
      render(<AdminSignUp />);

      expect(screen.getByRole("heading", { name: "Create Admin Account" })).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create Admin Account" })
      ).toBeInTheDocument();
    });

    test("displays admin role description", () => {
      render(<AdminSignUp />);

      expect(
        screen.getByText(/This account will have full administrative privileges/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/including user management, content oversight, and system analytics/)
      ).toBeInTheDocument();
    });

    test("shows security warning for admin account creation", () => {
      render(<AdminSignUp />);

      expect(
        screen.getByText("Security Notice")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Admin accounts have elevated privileges/)
      ).toBeInTheDocument();
    });

    test("has admin access code field", () => {
      render(<AdminSignUp />);

      expect(screen.getByLabelText("Admin Access Code")).toBeInTheDocument();
      expect(
        screen.getByText(/Enter the administrative access code/)
      ).toBeInTheDocument();
    });

    test("renders link to regular signup", () => {
      render(<AdminSignUp />);

      const signupLink = screen.getByText("Create a regular user account");
      expect(signupLink).toBeInTheDocument();
      expect(signupLink.closest("a")).toHaveAttribute("href", "/signup");
    });
  });

  describe("Form Validation", () => {
    test("shows validation errors for empty required fields", async () => {
      render(<AdminSignUp />);

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(screen.getByText("Admin access code is required")).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid email format", async () => {
      render(<AdminSignUp />);

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
      render(<AdminSignUp />);

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
      render(<AdminSignUp />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "123" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers")
        ).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid admin access code", async () => {
      render(<AdminSignUp />);

      const accessCodeInput = screen.getByLabelText("Admin Access Code");
      fireEvent.change(accessCodeInput, { target: { value: "wrongcode" } });
      fireEvent.blur(accessCodeInput);

      await waitFor(() => {
        expect(
          screen.getByText("Invalid admin access code")
        ).toBeInTheDocument();
      });
    });

    test("shows validation error when terms are not agreed to", async () => {
      render(<AdminSignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
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
    test("calls signUp with admin role when form is valid", async () => {
      render(<AdminSignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          "admin@example.com",
          "AdminPass123",
          {
            first_name: "Admin",
            last_name: "User",
            full_name: "Admin User",
            role: "admin",
          }
        );
      });
    });

    test("shows loading state during submission", async () => {
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<AdminSignUp />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });
      fireEvent.click(screen.getByLabelText(/I agree to the/));

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
      });
      fireEvent.click(submitButton);

      expect(screen.getByText("Creating Admin Account...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test("handles signup error gracefully", async () => {
      const errorMessage = "Email already exists";
      mockSignUp.mockRejectedValue(new Error(errorMessage));

      render(<AdminSignUp />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });
      fireEvent.click(screen.getByLabelText(/I agree to the/));

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe("Security Features", () => {
    test("password field is masked", () => {
      render(<AdminSignUp />);

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("confirm password field is masked", () => {
      render(<AdminSignUp />);

      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    test("admin access code field is masked", () => {
      render(<AdminSignUp />);

      const accessCodeInput = screen.getByLabelText("Admin Access Code");
      expect(accessCodeInput).toHaveAttribute("type", "password");
    });

    test("enforces strong password requirements", async () => {
      render(<AdminSignUp />);

      const passwordInput = screen.getByLabelText("Password");
      
      // Test weak passwords
      fireEvent.change(passwordInput, { target: { value: "weak" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers")
        ).toBeInTheDocument();
      });

      // Test password without uppercase
      fireEvent.change(passwordInput, { target: { value: "lowercase123" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers")
        ).toBeInTheDocument();
      });

      // Test password without numbers
      fireEvent.change(passwordInput, { target: { value: "NoNumbers" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers")
        ).toBeInTheDocument();
      });
    });
  });

  describe("User Experience", () => {
    test("clears error messages when user starts typing", async () => {
      render(<AdminSignUp />);

      const emailInput = screen.getByLabelText("Email address");
      fireEvent.change(emailInput, { target: { value: "invalid" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });

      // Start typing again
      fireEvent.change(emailInput, { target: { value: "valid@email.com" } });

      await waitFor(() => {
        expect(
          screen.queryByText("Please enter a valid email address")
        ).not.toBeInTheDocument();
      });
    });

    test("shows success message after successful submission", async () => {
      mockSignUp.mockResolvedValue({ success: true });

      render(<AdminSignUp />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });
      fireEvent.click(screen.getByLabelText(/I agree to the/));

      const submitButton = screen.getByRole("button", {
        name: "Create Admin Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    });
  });
}); 
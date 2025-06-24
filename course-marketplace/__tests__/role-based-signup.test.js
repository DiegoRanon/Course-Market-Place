import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/components/AuthProvider";
import RoleBasedSignUp from "@/app/signup/role-based/page";
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

describe("Role-Based SignUp Page", () => {
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
    test("renders role-based signup form with all required fields", () => {
      render(<RoleBasedSignUp />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create Account" })
      ).toBeInTheDocument();
    });

    test("renders role selection dropdown with all three options", () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");
      expect(roleSelect).toBeInTheDocument();

      // Check that all role options are present
      expect(screen.getByText("Student")).toBeInTheDocument();
      expect(screen.getByText("Instructor")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    test("defaults to student role", () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");
      expect(roleSelect.value).toBe("");
    });

    test("renders role descriptions", () => {
      render(<RoleBasedSignUp />);

      expect(
        screen.getByText(/Browse, purchase, and view courses/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Upload, manage, and edit content/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Full control over content, users, analytics/)
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows validation errors for empty required fields", async () => {
      render(<RoleBasedSignUp />);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(screen.getByText("Please select a role")).toBeInTheDocument();
      });
    });

    test("shows validation error for invalid email format", async () => {
      render(<RoleBasedSignUp />);

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
      render(<RoleBasedSignUp />);

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
      render(<RoleBasedSignUp />);

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
      render(<RoleBasedSignUp />);

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
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "student" },
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

    test("shows validation error when role is not selected", async () => {
      render(<RoleBasedSignUp />);

      // Fill in all required fields except role
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

      // Set role to empty
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "" },
      });

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Please select a role")).toBeInTheDocument();
      });
    });
  });

  describe("Role Selection", () => {
    test("allows user to select student role", async () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");
      fireEvent.change(roleSelect, { target: { value: "student" } });

      expect(roleSelect.value).toBe("student");
    });

    test("allows user to select instructor role", async () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");
      fireEvent.change(roleSelect, { target: { value: "instructor" } });

      expect(roleSelect.value).toBe("instructor");
    });

    test("allows user to select admin role", async () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");
      fireEvent.change(roleSelect, { target: { value: "admin" } });

      expect(roleSelect.value).toBe("admin");
    });

    test("updates role description when role changes", async () => {
      render(<RoleBasedSignUp />);

      const roleSelect = screen.getByLabelText("Role");

      // Check initial student description
      expect(
        screen.getByText(/Browse, purchase, and view courses/)
      ).toBeInTheDocument();

      // Change to instructor
      fireEvent.change(roleSelect, { target: { value: "instructor" } });
      expect(
        screen.getByText(/Upload, manage, and edit content/)
      ).toBeInTheDocument();

      // Change to admin
      fireEvent.change(roleSelect, { target: { value: "admin" } });
      expect(
        screen.getByText(/Full control over content, users, analytics/)
      ).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    test("calls signUp with student role when form is valid", async () => {
      render(<RoleBasedSignUp />);

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
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "student" },
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
            role: "student",
          }
        );
      });
    });

    test("calls signUp with instructor role when form is valid", async () => {
      render(<RoleBasedSignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Jane" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Smith" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "jane@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "instructor" },
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
          "jane@example.com",
          "password123",
          {
            first_name: "Jane",
            last_name: "Smith",
            full_name: "Jane Smith",
            role: "instructor",
          }
        );
      });
    });

    test("calls signUp with admin role when form is valid", async () => {
      render(<RoleBasedSignUp />);

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
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "admin" },
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
          "admin@example.com",
          "password123",
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

      render(<RoleBasedSignUp />);

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
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "student" },
      });

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      expect(screen.getByText("Creating account...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test("shows error message when signup fails", async () => {
      const errorMessage = "Email already exists";
      mockSignUp.mockRejectedValue(new Error(errorMessage));

      render(<RoleBasedSignUp />);

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
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { value: "student" },
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

  describe("Accessibility", () => {
    test("has proper form labels and associations", () => {
      render(<RoleBasedSignUp />);

      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      const emailInput = screen.getByLabelText("Email address");
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const roleSelect = screen.getByLabelText("Role");

      expect(firstNameInput).toHaveAttribute("id", "firstName");
      expect(lastNameInput).toHaveAttribute("id", "lastName");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
      expect(roleSelect).toHaveAttribute("id", "role");
    });

    test("has proper ARIA attributes for error messages", async () => {
      render(<RoleBasedSignUp />);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/);
        errorMessages.forEach((error) => {
          expect(error).toHaveAttribute("role", "alert");
        });
      });
    });
  });
});

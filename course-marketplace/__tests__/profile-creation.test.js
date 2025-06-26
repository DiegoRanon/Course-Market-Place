import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import SignUp from "@/app/signup/page";
import AdminSignUp from "@/app/signup/admin/page";
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

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
  },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      error: null,
    })),
  })),
};

jest.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

describe("Profile Creation Tests", () => {
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
    mockPush.mockClear();
    mockSupabase.auth.signUp.mockClear();
    mockSupabase.from.mockClear();
  });

  describe("Regular Student Signup", () => {
    test("creates profile with student role when regular signup is successful", async () => {
      // Mock successful signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

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

      // Verify that the signUp function was called (which should create profile)
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });

    test("passes correct user data to signUp function for student", async () => {
      render(<SignUp />);

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
          }
        );
      });
    });
  });

  describe("Admin Signup", () => {
    test("creates profile with admin role when admin signup is successful", async () => {
      // Mock successful signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "admin-123" } },
        error: null,
      });

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

      // Verify that the signUp function was called (which should create profile)
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });

    test("passes correct user data to signUp function for admin", async () => {
      render(<AdminSignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Super" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "superadmin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "SuperPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "SuperPass123" },
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
          "superadmin@example.com",
          "SuperPass123",
          {
            first_name: "Super",
            last_name: "Admin",
            full_name: "Super Admin",
            role: "admin",
          }
        );
      });
    });

    test("includes role field in userData for admin signup", async () => {
      render(<AdminSignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Admin" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "testadmin@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "TestPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "TestPass123" },
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
        const callArgs = mockSignUp.mock.calls[0];
        const userData = callArgs[2];
        expect(userData).toHaveProperty("role", "admin");
      });
    });
  });

  describe("Role Assignment Logic", () => {
    test("regular signup does not include role field (defaults to student)", async () => {
      render(<SignUp />);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Student" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "student@example.com" },
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
        const callArgs = mockSignUp.mock.calls[0];
        const userData = callArgs[2];
        expect(userData).not.toHaveProperty("role");
      });
    });

    test("admin signup explicitly includes role field", async () => {
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
        const callArgs = mockSignUp.mock.calls[0];
        const userData = callArgs[2];
        expect(userData).toHaveProperty("role", "admin");
      });
    });
  });
}); 
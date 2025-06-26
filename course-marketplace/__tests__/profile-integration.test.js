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

describe("Profile Creation Integration Tests", () => {
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

  describe("Complete Signup Flow", () => {
    test("regular signup creates profile with student role", async () => {
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
        target: { value: "Student" },
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
            last_name: "Student",
            full_name: "John Student",
          }
        );
      });

      // Verify no role is passed (will default to student)
      const callArgs = mockSignUp.mock.calls[0];
      const userData = callArgs[2];
      expect(userData).not.toHaveProperty("role");
    });

    test("admin signup creates profile with admin role", async () => {
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

      // Verify admin role is explicitly passed
      const callArgs = mockSignUp.mock.calls[0];
      const userData = callArgs[2];
      expect(userData).toHaveProperty("role", "admin");
    });
  });

  describe("Data Consistency", () => {
    test("regular signup creates consistent profile data structure", async () => {
      // Test regular signup
      render(<SignUp />);
      
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "User" },
      });
      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByLabelText(/I agree to the/));
      fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

      await waitFor(() => {
        const callArgs = mockSignUp.mock.calls[0];
        const userData = callArgs[2];
        
        // Verify required fields are present
        expect(userData).toHaveProperty("first_name", "Test");
        expect(userData).toHaveProperty("last_name", "User");
        expect(userData).toHaveProperty("full_name", "Test User");
        expect(userData).not.toHaveProperty("role");
      });
    });

    test("admin signup creates consistent profile data structure", async () => {
      // Test admin signup
      render(<AdminSignUp />);
      
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
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "AdminPass123" },
      });
      fireEvent.change(screen.getByLabelText("Admin Access Code"), {
        target: { value: "ADMIN2024" },
      });
      fireEvent.click(screen.getByLabelText(/I agree to the/));
      fireEvent.click(screen.getByRole("button", { name: "Create Admin Account" }));

      await waitFor(() => {
        const callArgs = mockSignUp.mock.calls[0];
        const userData = callArgs[2];
        
        // Verify required fields are present
        expect(userData).toHaveProperty("first_name", "Test");
        expect(userData).toHaveProperty("last_name", "Admin");
        expect(userData).toHaveProperty("full_name", "Test Admin");
        expect(userData).toHaveProperty("role", "admin");
      });
    });
  });
}); 
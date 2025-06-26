import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import SignUp from "@/app/signup/page";
import AdminSignUp from "@/app/signup/admin/page";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/lib/AuthProvider", () => ({
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

describe("Authentication and Profile Creation Error Tests", () => {
  const mockUser = null;
  const mockLoading = false;

  beforeEach(() => {
    mockSupabase.auth.signUp.mockClear();
    mockSupabase.from.mockClear();
    mockPush.mockClear();
  });

  describe("Profile Creation Error Handling", () => {
    test("handles 401 unauthorized error when creating profile", async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock profile creation error
      const mockInsert = jest.fn(() => ({
        error: { code: 401, message: "Unauthorized" },
      }));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Mock the useAuth hook to return a signUp function that calls the real logic
      const mockSignUp = jest.fn(async (email, password, userData) => {
        const { data, error } = await mockSupabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;

        // Create profile record if signup is successful
        if (data.user) {
          try {
            const { error: profileError } = await mockSupabase.from("profiles").insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name: userData.full_name,
              role: userData.role || "student",
              status: "active",
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          } catch (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return data;
      });

      useAuth.mockReturnValue({
        user: mockUser,
        loading: mockLoading,
        signUp: mockSignUp,
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
        expect(mockSignUp).toHaveBeenCalled();
      });

      // Verify that the profile creation was attempted
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockInsert).toHaveBeenCalledWith({
        id: "user-123",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        role: "student",
        status: "active",
      });
    });

    test("handles profile creation error gracefully", async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock profile creation error
      const mockInsert = jest.fn(() => ({
        error: { code: 500, message: "Internal server error" },
      }));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Mock the useAuth hook
      const mockSignUp = jest.fn(async (email, password, userData) => {
        const { data, error } = await mockSupabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;

        // Create profile record if signup is successful
        if (data.user) {
          try {
            const { error: profileError } = await mockSupabase.from("profiles").insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name: userData.full_name,
              role: userData.role || "student",
              status: "active",
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          } catch (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return data;
      });

      useAuth.mockReturnValue({
        user: mockUser,
        loading: mockLoading,
        signUp: mockSignUp,
      });

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
        expect(mockSignUp).toHaveBeenCalled();
      });

      // The signup should still succeed even if profile creation fails
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

    test("admin signup handles profile creation error", async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "admin-123" } },
        error: null,
      });

      // Mock profile creation error
      const mockInsert = jest.fn(() => ({
        error: { code: 401, message: "Unauthorized" },
      }));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Mock the useAuth hook
      const mockSignUp = jest.fn(async (email, password, userData) => {
        const { data, error } = await mockSupabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;

        // Create profile record if signup is successful
        if (data.user) {
          try {
            const { error: profileError } = await mockSupabase.from("profiles").insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name: userData.full_name,
              role: userData.role || "student",
              status: "active",
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          } catch (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return data;
      });

      useAuth.mockReturnValue({
        user: mockUser,
        loading: mockLoading,
        signUp: mockSignUp,
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
        expect(mockSignUp).toHaveBeenCalled();
      });

      // Verify admin profile creation was attempted
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockInsert).toHaveBeenCalledWith({
        id: "admin-123",
        first_name: "Admin",
        last_name: "User",
        full_name: "Admin User",
        role: "admin",
        status: "active",
      });
    });
  });

  describe("Authentication Flow", () => {
    test("signup succeeds even when profile creation fails", async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock profile creation error
      const mockInsert = jest.fn(() => ({
        error: { code: 401, message: "Unauthorized" },
      }));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Mock the useAuth hook
      const mockSignUp = jest.fn(async (email, password, userData) => {
        const { data, error } = await mockSupabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;

        // Create profile record if signup is successful
        if (data.user) {
          try {
            const { error: profileError } = await mockSupabase.from("profiles").insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name: userData.full_name,
              role: userData.role || "student",
              status: "active",
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          } catch (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return data;
      });

      useAuth.mockReturnValue({
        user: mockUser,
        loading: mockLoading,
        signUp: mockSignUp,
      });

      render(<SignUp />);

      // Fill in all required fields
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

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });

      // The signup should complete successfully
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        {
          first_name: "Test",
          last_name: "User",
          full_name: "Test User",
        }
      );
    });

    test("successful profile creation", async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock successful profile creation
      const mockInsert = jest.fn(() => ({
        error: null,
        data: { id: "user-123", first_name: "Test" },
      }));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Mock the useAuth hook
      const mockSignUp = jest.fn(async (email, password, userData) => {
        const { data, error } = await mockSupabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;

        // Create profile record if signup is successful
        if (data.user) {
          try {
            const { error: profileError } = await mockSupabase.from("profiles").insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name: userData.full_name,
              role: userData.role || "student",
              status: "active",
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          } catch (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return data;
      });

      useAuth.mockReturnValue({
        user: mockUser,
        loading: mockLoading,
        signUp: mockSignUp,
      });

      render(<SignUp />);

      // Fill in all required fields
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

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole("button", {
        name: "Create Account",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });

      // Verify successful profile creation
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockInsert).toHaveBeenCalledWith({
        id: "user-123",
        first_name: "Test",
        last_name: "User",
        full_name: "Test User",
        role: "student",
        status: "active",
      });
    });
  });
}); 
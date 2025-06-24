import {
  signUp,
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../lib/auth";
import { supabase } from "../lib/supabase";

// Mock Supabase client
jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe("Authentication Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        origin: "http://localhost:3000",
      },
      writable: true,
    });
  });

  describe("Sign Up", () => {
    test("signUp should create a new user account", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        user_metadata: {
          first_name: "John",
          last_name: "Doe",
        },
      };

      const mockData = {
        user: mockUser,
        session: null,
      };

      supabase.auth.signUp.mockResolvedValue({ data: mockData, error: null });

      const result = await signUp("test@example.com", "password123", {
        first_name: "John",
        last_name: "Doe",
      });

      expect(result).toEqual(mockData);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            first_name: "John",
            last_name: "Doe",
          },
        },
      });
    });

    test("signUp should handle errors", async () => {
      const mockError = new Error("Email already exists");

      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      await expect(signUp("test@example.com", "password123")).rejects.toThrow(
        "Email already exists"
      );
    });
  });

  describe("Sign In", () => {
    test("signIn should authenticate user with email and password", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      };

      const mockSession = {
        access_token: "token-123",
        refresh_token: "refresh-123",
        user: mockUser,
      };

      const mockData = {
        user: mockUser,
        session: mockSession,
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await signIn("test@example.com", "password123");

      expect(result).toEqual(mockData);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    test("signIn should handle authentication errors", async () => {
      const mockError = new Error("Invalid credentials");

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(signIn("test@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("Sign Out", () => {
    test("signOut should sign out the current user", async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    test("signOut should handle errors", async () => {
      const mockError = new Error("Sign out failed");

      supabase.auth.signOut.mockResolvedValue({ error: mockError });

      await expect(signOut()).rejects.toThrow("Sign out failed");
    });
  });

  describe("Session Management", () => {
    test("getSession should return current session", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      };

      const mockSession = {
        access_token: "token-123",
        refresh_token: "refresh-123",
        user: mockUser,
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    test("getSession should handle no session", async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result).toBeNull();
    });

    test("getSession should handle errors", async () => {
      const mockError = new Error("Session error");

      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await expect(getSession()).rejects.toThrow("Session error");
    });

    test("onAuthStateChange should set up auth state listener", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        mockCallback
      );
      expect(result).toEqual({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });
    });
  });

  describe("Password Management", () => {
    test("resetPassword should send password reset email", async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await resetPassword("test@example.com");

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        {
          redirectTo: "http://localhost:3000/reset-password",
        }
      );
    });

    test("resetPassword should handle errors", async () => {
      const mockError = new Error("Email not found");

      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: mockError,
      });

      await expect(resetPassword("nonexistent@example.com")).rejects.toThrow(
        "Email not found"
      );
    });

    test("updatePassword should update user password", async () => {
      supabase.auth.updateUser.mockResolvedValue({ error: null });

      await updatePassword("newpassword123");

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newpassword123",
      });
    });

    test("updatePassword should handle errors", async () => {
      const mockError = new Error("Password too weak");

      supabase.auth.updateUser.mockResolvedValue({ error: mockError });

      await expect(updatePassword("weak")).rejects.toThrow("Password too weak");
    });
  });

  describe("Profile Management", () => {
    test("updateProfile should update user profile", async () => {
      const mockData = {
        id: "user-1",
        first_name: "John",
        last_name: "Doe",
        bio: "Updated bio",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await updateProfile("user-1", {
        first_name: "John",
        last_name: "Doe",
        bio: "Updated bio",
      });

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("profiles");
    });

    test("updateProfile should handle errors", async () => {
      const mockError = new Error("Profile update failed");

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(
        updateProfile("user-1", { first_name: "John" })
      ).rejects.toThrow("Profile update failed");
    });
  });

  describe("Error Handling", () => {
    test("should throw error when auth operation fails", async () => {
      const mockError = new Error("Network error");

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(signIn("test@example.com", "password123")).rejects.toThrow(
        "Network error"
      );
    });

    test("should throw error when profile update fails", async () => {
      const mockError = new Error("Database error");

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(
        updateProfile("user-1", { first_name: "John" })
      ).rejects.toThrow("Database error");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty email in signUp", async () => {
      const mockError = new Error("Email is required");

      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      await expect(signUp("", "password123")).rejects.toThrow(
        "Email is required"
      );
    });

    test("should handle weak password in signUp", async () => {
      const mockError = new Error("Password too weak");

      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      await expect(signUp("test@example.com", "123")).rejects.toThrow(
        "Password too weak"
      );
    });

    test("should handle invalid email format", async () => {
      const mockError = new Error("Invalid email format");

      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      await expect(signUp("invalid-email", "password123")).rejects.toThrow(
        "Invalid email format"
      );
    });
  });
});

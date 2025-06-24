import { testSupabaseConnection, testAuth } from "../lib/test-connection";
import { supabase } from "../lib/supabase";

// Mock Supabase client
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("Supabase Connection Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("testSupabaseConnection", () => {
    test("should return true when connection is successful", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const mockQuery = {
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Testing Supabase connection...");
      expect(consoleSpy).toHaveBeenCalledWith(
        "✅ Supabase connection successful!"
      );
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockQuery.limit).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
    });

    test("should return false when connection fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Connection failed");

      const mockQuery = {
        limit: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Supabase connection failed:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });

    test("should return false when exception occurs", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Network error");

      supabase.from.mockImplementation(() => {
        throw mockError;
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Supabase connection error:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });

    test("should handle database query errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = { message: "Table does not exist" };

      const mockQuery = {
        limit: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Supabase connection failed:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });
  });

  describe("testAuth", () => {
    test("should return true when auth test is successful with active session", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockSession = {
        access_token: "token-123",
        user: { id: "user-1", email: "test@example.com" },
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await testAuth();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Testing Supabase auth...");
      expect(consoleSpy).toHaveBeenCalledWith("✅ Auth test successful!");
      expect(consoleSpy).toHaveBeenCalledWith("Session:", "Active");
      expect(supabase.auth.getSession).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should return true when auth test is successful without session", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await testAuth();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Testing Supabase auth...");
      expect(consoleSpy).toHaveBeenCalledWith("✅ Auth test successful!");
      expect(consoleSpy).toHaveBeenCalledWith("Session:", "No session");

      consoleSpy.mockRestore();
    });

    test("should return false when auth test fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Auth service unavailable");

      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await testAuth();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Auth test failed:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });

    test("should return false when auth test throws exception", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Network error");

      supabase.auth.getSession.mockImplementation(() => {
        throw mockError;
      });

      const result = await testAuth();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Auth test error:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });

    test("should handle auth service errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = { message: "Invalid API key" };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await testAuth();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Auth test failed:",
        mockError.message
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Integration Tests", () => {
    test("should test both connection and auth together", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock successful connection
      const mockConnectionQuery = {
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockConnectionQuery),
      });

      // Mock successful auth
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const connectionResult = await testSupabaseConnection();
      const authResult = await testAuth();

      expect(connectionResult).toBe(true);
      expect(authResult).toBe(true);

      consoleSpy.mockRestore();
    });

    test("should handle mixed results", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const errorSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock failed connection
      const mockConnectionQuery = {
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection failed" },
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockConnectionQuery),
      });

      // Mock successful auth
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const connectionResult = await testSupabaseConnection();
      const authResult = await testAuth();

      expect(connectionResult).toBe(false);
      expect(authResult).toBe(true);

      consoleSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe("Error Scenarios", () => {
    test("should handle malformed response from connection test", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const mockQuery = {
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Supabase connection failed:",
        "Not found"
      );

      consoleSpy.mockRestore();
    });

    test("should handle timeout scenarios", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const mockQuery = {
        limit: jest.fn().mockImplementation(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 100);
          });
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await testSupabaseConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Supabase connection error:",
        "Timeout"
      );

      consoleSpy.mockRestore();
    });

    test("should handle auth timeout scenarios", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      supabase.auth.getSession.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth timeout")), 100);
        });
      });

      const result = await testAuth();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Auth test error:",
        "Auth timeout"
      );

      consoleSpy.mockRestore();
    });
  });
});

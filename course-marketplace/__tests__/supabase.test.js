import {
  supabase,
  getCurrentUser,
  getUserProfile,
  isAdmin,
  isInstructor,
} from "../app/lib/supabase";

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock Supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

describe("Supabase Configuration", () => {
  test("should create Supabase client with environment variables", () => {
    const { createClient } = require("@supabase/supabase-js");

    // Re-import to trigger the configuration
    jest.resetModules();
    require("../app/lib/supabase");

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });

  test("should throw error when environment variables are missing", () => {
    // Temporarily remove environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    jest.resetModules();

    expect(() => {
      require("../app/lib/supabase");
    }).toThrow(
      "Missing Supabase environment variables. Please check your .env.local file."
    );

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });
});

describe("Supabase Utility Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    test("should return current user when authenticated", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    test("should return null when not authenticated", async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    test("should return null and log error when auth fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Auth error");

      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting current user:",
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getUserProfile", () => {
    test("should return user profile when found", async () => {
      const mockProfile = {
        id: "user-1",
        first_name: "John",
        last_name: "Doe",
        role: "student",
        status: "active",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await getUserProfile("user-1");

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "user-1");
    });

    test("should return null when profile not found", async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await getUserProfile("nonexistent-user");

      expect(result).toBeNull();
    });

    test("should return null and log error when query fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Database error");

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await getUserProfile("user-1");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting user profile:",
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe("isAdmin", () => {
    test("should return true for admin user", async () => {
      const mockProfile = {
        id: "user-1",
        role: "admin",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isAdmin("user-1");

      expect(result).toBe(true);
    });

    test("should return false for non-admin user", async () => {
      const mockProfile = {
        id: "user-1",
        role: "student",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isAdmin("user-1");

      expect(result).toBe(false);
    });

    test("should return false when profile not found", async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isAdmin("nonexistent-user");

      expect(result).toBe(false);
    });

    test("should return false when profile query fails", async () => {
      const mockError = new Error("Database error");

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isAdmin("user-1");

      expect(result).toBe(false);
    });
  });

  describe("isInstructor", () => {
    test("should return true for instructor user", async () => {
      const mockProfile = {
        id: "user-1",
        role: "instructor",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isInstructor("user-1");

      expect(result).toBe(true);
    });

    test("should return true for admin user", async () => {
      const mockProfile = {
        id: "user-1",
        role: "admin",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isInstructor("user-1");

      expect(result).toBe(true);
    });

    test("should return false for student user", async () => {
      const mockProfile = {
        id: "user-1",
        role: "student",
      };

      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockProfile, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isInstructor("user-1");

      expect(result).toBe(false);
    });

    test("should return false when profile not found", async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await isInstructor("nonexistent-user");

      expect(result).toBe(false);
    });
  });
});

describe("Supabase Client Methods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should have auth methods available", () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.getUser).toBe("function");
  });

  test("should have from method available", () => {
    expect(typeof supabase.from).toBe("function");
  });

  test("should be able to query tables", () => {
    const mockQuery = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };

    supabase.from.mockReturnValue(mockQuery);

    const result = supabase.from("profiles");

    expect(result).toBe(mockQuery);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });
});

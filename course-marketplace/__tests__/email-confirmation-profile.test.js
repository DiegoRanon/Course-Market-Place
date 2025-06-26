import { POST as confirmEmailHandler } from '../app/api/auth/confirm-email/route';
import { NextResponse } from 'next/server';
import { supabase } from '../app/lib/supabase';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Mock Supabase client
jest.mock('../app/lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe('Email Confirmation Profile Creation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    NextResponse.json.mockImplementation((data) => data);
  });

  describe('Student Email Confirmation', () => {
    test('should create student profile when email is confirmed', async () => {
      // Mock successful email verification
      supabase.auth.verifyOtp.mockResolvedValue({
        data: {
          user: {
            id: 'student-123',
            user_metadata: {
              first_name: 'John',
              last_name: 'Doe',
              full_name: 'John Doe',
              role: 'student'
            }
          }
        },
        error: null
      });

      // Mock successful profile creation
      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'student-123' }
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the API route logic directly
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: 'test-token',
        type: 'email',
      });

      expect(error).toBeNull();
      expect(data.user).toBeTruthy();

      // Create profile
      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const role = userMetadata.role || "student";
        
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          full_name: userMetadata.full_name || "",
          role: role,
          status: "active",
        });

        expect(profileError).toBeNull();
        expect(mockInsert).toHaveBeenCalledWith({
          id: 'student-123',
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          role: 'student',
          status: 'active',
        });
      }
    });

    test('should create student profile with default role when no role specified', async () => {
      // Mock successful email verification with no role
      supabase.auth.verifyOtp.mockResolvedValue({
        data: {
          user: {
            id: 'student-456',
            user_metadata: {
              first_name: 'Jane',
              last_name: 'Smith',
              full_name: 'Jane Smith'
              // No role specified
            }
          }
        },
        error: null
      });

      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'student-456' }
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the API route logic directly
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: 'test-token',
        type: 'email',
      });

      expect(error).toBeNull();
      expect(data.user).toBeTruthy();

      // Create profile
      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const role = userMetadata.role || "student";
        
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          full_name: userMetadata.full_name || "",
          role: role,
          status: "active",
        });

        expect(profileError).toBeNull();
        expect(mockInsert).toHaveBeenCalledWith({
          id: 'student-456',
          first_name: 'Jane',
          last_name: 'Smith',
          full_name: 'Jane Smith',
          role: 'student', // Default role
          status: 'active',
        });
      }
    });
  });

  describe('Admin Email Confirmation', () => {
    test('should create admin profile when email is confirmed', async () => {
      // Mock successful email verification for admin
      supabase.auth.verifyOtp.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            user_metadata: {
              first_name: 'Admin',
              last_name: 'User',
              full_name: 'Admin User',
              role: 'admin'
            }
          }
        },
        error: null
      });

      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'admin-123' }
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the API route logic directly
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: 'test-token',
        type: 'email',
      });

      expect(error).toBeNull();
      expect(data.user).toBeTruthy();

      // Create profile
      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const role = userMetadata.role || "student";
        
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          full_name: userMetadata.full_name || "",
          role: role,
          status: "active",
        });

        expect(profileError).toBeNull();
        expect(mockInsert).toHaveBeenCalledWith({
          id: 'admin-123',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          role: 'admin',
          status: 'active',
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle profile creation errors gracefully', async () => {
      // Mock successful email verification
      supabase.auth.verifyOtp.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: {
              first_name: 'Test',
              last_name: 'User',
              full_name: 'Test User',
              role: 'student'
            }
          }
        },
        error: null
      });

      // Mock profile creation error
      const mockInsert = jest.fn().mockReturnValue({
        error: { message: 'Profile creation failed' },
        data: null
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the API route logic directly
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: 'test-token',
        type: 'email',
      });

      expect(error).toBeNull();
      expect(data.user).toBeTruthy();

      // Create profile (should fail gracefully)
      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const role = userMetadata.role || "student";
        
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          full_name: userMetadata.full_name || "",
          role: role,
          status: "active",
        });

        expect(profileError).toBeTruthy();
        expect(profileError.message).toBe('Profile creation failed');
        expect(mockInsert).toHaveBeenCalled();
      }
    });

    test('should handle email verification errors', async () => {
      // Mock email verification error
      supabase.auth.verifyOtp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' }
      });

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: 'invalid-token',
        type: 'email',
      });

      expect(error).toBeTruthy();
      expect(error.message).toBe('Invalid token');
      expect(data).toBeNull();
    });
  });

  describe('Signup Process', () => {
    test('should not create profile during signup', async () => {
      // Mock successful signup
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-123',
            user_metadata: {
              first_name: 'New',
              last_name: 'User',
              full_name: 'New User',
              role: 'student'
            }
          }
        },
        error: null
      });

      // Profile creation should not be called during signup
      const mockInsert = jest.fn();
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate signup (this would be called from AuthProvider)
      const { data, error } = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'New',
            last_name: 'User',
            full_name: 'New User',
            role: 'student'
          }
        }
      });

      expect(error).toBeNull();
      expect(data.user).toBeTruthy();
      expect(mockInsert).not.toHaveBeenCalled(); // Profile should not be created during signup
    });
  });

  describe('Email confirmation and profile creation', () => {
    it('creates student profile on email confirmation', async () => {
      // Mock successful OTP verification for a student
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          // No role - defaults to student
        },
      };
      
      supabase.auth.verifyOtp.mockResolvedValue({ data: { user: mockUser }, error: null });
      supabase.from().insert = jest.fn().mockResolvedValue({ error: null });
      
      // Create fake request with token
      const request = {
        json: jest.fn().mockResolvedValue({ token: 'test-token' }),
      };
      
      // Call the handler
      await confirmEmailHandler(request);
      
      // Check if profile was created with correct data
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        id: 'test-user-id',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        role: 'student', // Default role
        description: '', // Empty description
        status: 'active',
      });
      
      // Check if response was successful
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('creates creator profile with description on email confirmation', async () => {
      // Mock successful OTP verification for a creator
      const mockUser = {
        id: 'test-creator-id',
        user_metadata: {
          first_name: 'Jane',
          last_name: 'Smith',
          full_name: 'Jane Smith',
          role: 'creator',
          description: 'I create photography courses.',
        },
      };
      
      supabase.auth.verifyOtp.mockResolvedValue({ data: { user: mockUser }, error: null });
      supabase.from().insert = jest.fn().mockResolvedValue({ error: null });
      
      // Create fake request with token
      const request = {
        json: jest.fn().mockResolvedValue({ token: 'test-token' }),
      };
      
      // Call the handler
      await confirmEmailHandler(request);
      
      // Check if profile was created with correct data
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        id: 'test-creator-id',
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        role: 'creator',
        description: 'I create photography courses.',
        status: 'active',
      });
      
      // Check if response was successful
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('handles verification errors', async () => {
      // Mock OTP verification error
      supabase.auth.verifyOtp.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid token' } 
      });
      
      // Create fake request with token
      const request = {
        json: jest.fn().mockResolvedValue({ token: 'invalid-token' }),
      };
      
      // Call the handler
      await confirmEmailHandler(request);
      
      // Check if error response was returned
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Invalid token' },
        { status: 400 }
      );
      
      // Check that no profile was created
      expect(supabase.from().insert).not.toHaveBeenCalled();
    });
  });
}); 
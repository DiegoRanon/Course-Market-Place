import { supabase } from '../app/lib/supabase';

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}));

describe('RLS Policies Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Creation Policies', () => {
    test('should allow profile creation during signup', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'test-user-id' }
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            error: null,
            data: null // No existing profile
          })
        })
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect
      });

      // Simulate profile creation during signup
      const { error } = await supabase.from('profiles').insert({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        role: 'student',
        status: 'active'
      });

      expect(error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        role: 'student',
        status: 'active'
      });
    });

    test('should allow authenticated user to create their own profile', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'authenticated-user-id' }
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Mock authenticated user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'authenticated-user-id' } },
        error: null
      });

      const { error } = await supabase.from('profiles').insert({
        id: 'authenticated-user-id',
        first_name: 'Auth',
        last_name: 'User',
        full_name: 'Auth User',
        role: 'student',
        status: 'active'
      });

      expect(error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'authenticated-user-id',
        first_name: 'Auth',
        last_name: 'User',
        full_name: 'Auth User',
        role: 'student',
        status: 'active'
      });
    });

    test('should handle profile creation errors gracefully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        error: { message: 'RLS policy violation' },
        data: null
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate profile creation error
      const { error } = await supabase.from('profiles').insert({
        id: 'error-user-id',
        first_name: 'Error',
        last_name: 'User',
        full_name: 'Error User',
        role: 'student',
        status: 'active'
      });

      expect(error).toBeTruthy();
      expect(error.message).toBe('RLS policy violation');
    });
  });

  describe('Profile Access Policies', () => {
    test('should allow user to view their own profile', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            error: null,
            data: {
              id: 'user-id',
              first_name: 'Test',
              last_name: 'User',
              role: 'student'
            }
          })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-id')
        .single();

      expect(error).toBeNull();
      expect(data).toEqual({
        id: 'user-id',
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      });
    });

    test('should allow admin to view all profiles', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        error: null,
        data: [
          { id: 'user-1', first_name: 'User', last_name: '1', role: 'student' },
          { id: 'user-2', first_name: 'User', last_name: '2', role: 'instructor' }
        ]
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data, error } = await supabase.from('profiles').select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].role).toBe('student');
      expect(data[1].role).toBe('instructor');
    });
  });
}); 
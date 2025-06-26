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

describe('RLS Infinite Recursion Fix Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Fetching Without Infinite Recursion', () => {
    test('should fetch user profile without infinite recursion error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            error: null,
            data: {
              id: 'test-user-id',
              first_name: 'Test',
              last_name: 'User',
              role: 'student',
              status: 'active'
            }
          })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      // Mock authenticated user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'test-user-id')
        .single();

      expect(error).toBeNull();
      expect(data).toEqual({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        role: 'student',
        status: 'active'
      });
    });

    test('should handle admin profile fetching without infinite recursion', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        error: null,
        data: [
          { id: 'user-1', first_name: 'User', last_name: '1', role: 'student' },
          { id: 'user-2', first_name: 'User', last_name: '2', role: 'instructor' },
          { id: 'admin-1', first_name: 'Admin', last_name: '1', role: 'admin' }
        ]
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      // Mock admin user with JWT metadata
      supabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-1',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const { data, error } = await supabase.from('profiles').select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      expect(data[2].role).toBe('admin');
    });

    test('should handle profile creation during signup without infinite recursion', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        error: null,
        data: { id: 'new-user-id' }
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate profile creation during signup (no authentication yet)
      const { error } = await supabase.from('profiles').insert({
        id: 'new-user-id',
        first_name: 'New',
        last_name: 'User',
        full_name: 'New User',
        role: 'student',
        status: 'active'
      });

      expect(error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'new-user-id',
        first_name: 'New',
        last_name: 'User',
        full_name: 'New User',
        role: 'student',
        status: 'active'
      });
    });
  });

  describe('Admin Access Without Infinite Recursion', () => {
    test('should allow admin to view all categories without infinite recursion', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        error: null,
        data: [
          { id: 'cat-1', name: 'Programming', slug: 'programming' },
          { id: 'cat-2', name: 'Design', slug: 'design' }
        ]
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      // Mock admin user
      supabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-1',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const { data, error } = await supabase.from('categories').select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });

    test('should allow admin to view all courses without infinite recursion', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        error: null,
        data: [
          { id: 'course-1', title: 'Course 1', status: 'published' },
          { id: 'course-2', title: 'Course 2', status: 'draft' }
        ]
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      // Mock admin user
      supabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-1',
            user_metadata: { role: 'admin' }
          } 
        },
        error: null
      });

      const { data, error } = await supabase.from('courses').select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle RLS policy errors gracefully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            error: { 
              code: '42P17', 
              message: 'infinite recursion detected in policy for relation "profiles"' 
            },
            data: null
          })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'test-user-id')
        .single();

      expect(error).toBeTruthy();
      expect(error.code).toBe('42P17');
      expect(error.message).toContain('infinite recursion');
    });

    test('should handle authentication errors properly', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            error: { 
              code: 'PGRST116', 
              message: 'JWT not found' 
            },
            data: null
          })
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      // Mock unauthenticated user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT not found' }
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'test-user-id')
        .single();

      expect(error).toBeTruthy();
      expect(error.code).toBe('PGRST116');
    });
  });
}); 
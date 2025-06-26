import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatorSignUp from '../app/signup/creator/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/lib/AuthProvider';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthProvider
jest.mock('../app/lib/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

describe('CreatorSignUp', () => {
  const mockPush = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    useAuth.mockReturnValue({ signUp: mockSignUp });
    
    // Mock successful signup
    mockSignUp.mockResolvedValue({ user: { id: 'test-user-id' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders creator signup form correctly', () => {
    render(<CreatorSignUp />);
    
    // Check if the form has all required fields
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates all fields on form submission', async () => {
    render(<CreatorSignUp />);
    
    // Submit form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm your password/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<CreatorSignUp />);
    
    // Fill email with invalid format
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    
    // Move focus to trigger validation
    fireEvent.blur(screen.getByLabelText(/email/i));
    
    // Check for validation message
    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    render(<CreatorSignUp />);
    
    // Fill passwords with different values
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password456' },
    });
    
    // Move focus to trigger validation
    fireEvent.blur(screen.getByLabelText(/confirm password/i));
    
    // Check for validation message
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('submits form with creator role when all fields are valid', async () => {
    render(<CreatorSignUp />);
    
    // Fill all fields correctly
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'I create web development courses focusing on React and Next.js.' },
    });
    
    // Check the terms checkbox
    const termsCheckbox = screen.getByLabelText(/I agree to the/i);
    fireEvent.click(termsCheckbox);
    
    // Submit form
    fireEvent.submit(screen.getByRole('form'));
    
    // Check if signUp was called with correct data
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'john.doe@example.com',
        'Password123',
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          role: 'creator',
          description: 'I create web development courses focusing on React and Next.js.'
        })
      );
    });
    
    // Check if redirect was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/confirm');
    });
  });

  it('handles signup errors', async () => {
    // Mock signUp to reject with error
    const mockError = new Error('Email already in use');
    mockSignUp.mockRejectedValueOnce(mockError);
    
    render(<CreatorSignUp />);
    
    // Fill all fields correctly
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'I create web development courses.' },
    });
    
    // Check the terms checkbox
    const termsCheckbox = screen.getByLabelText(/I agree to the/i);
    fireEvent.click(termsCheckbox);
    
    // Submit form
    fireEvent.submit(screen.getByRole('form'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });
}); 
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import AdminUsersPage from "@/app/admin/users/page";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock API calls
jest.mock("@/app/lib/api/profiles", () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserEnrollments: jest.fn(),
  getUserPurchases: jest.fn(),
  updateUserRole: jest.fn(),
  updateUserStatus: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the formatDate function
jest.mock("@/app/lib/utils", () => ({
  formatDate: () => "31 déc. 2023",
}));

describe("Admin Users Page", () => {
  const mockUsers = [
    { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'student', status: 'active', created_at: '2023-01-01' },
    { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'creator', status: 'active', created_at: '2023-01-02' },
    { id: '3', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', role: 'admin', status: 'active', created_at: '2023-01-03' },
  ];

  const mockEnrollments = [
    { id: 'e1', user_id: '1', course_id: 'c1', courses: { title: 'Test Course Enrollment' }, completion_percentage: 50, purchased_at: '2023-01-15' }
  ];

  const mockPurchases = [
    { id: 'p1', user_id: '1', course_id: 'c1', courses: { title: 'Test Course Purchase' }, amount: 49.99, status: 'completed', purchased_at: '2023-01-15' }
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { id: '3', email: 'admin@example.com' },
      profile: { role: 'admin' },
      loading: false,
    });
    
    const profilesAPI = require("@/app/lib/api/profiles");
    profilesAPI.getAllUsers.mockResolvedValue({ data: mockUsers });
    profilesAPI.getUserEnrollments.mockResolvedValue({ data: mockEnrollments });
    profilesAPI.getUserPurchases.mockResolvedValue({ data: mockPurchases });
    profilesAPI.updateUserRole.mockResolvedValue({ success: true });
    profilesAPI.updateUserStatus.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the users table with all users", async () => {
    render(<AdminUsersPage />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    // Check for table headers
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Joined")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("allows filtering users by role", async () => {
    render(<AdminUsersPage />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select student role filter
    const roleFilter = screen.getByLabelText("Filter by role");
    fireEvent.change(roleFilter, { target: { value: "student" } });

    // Should only show student users
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
  });

  it("allows searching users by name or email", async () => {
    render(<AdminUsersPage />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Search for "jane"
    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "jane" } });

    // Should only show Jane Smith
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
  });

  it("shows user details when clicking on a user", async () => {
    render(<AdminUsersPage />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click on a user row
    fireEvent.click(screen.getByText("John Doe"));

    // Should show user details
    await waitFor(() => {
      expect(screen.getByText("User Details")).toBeInTheDocument();
      
      // Find the role section in the user details
      const roleSection = screen.getAllByText("Role")[1].closest('div');
      expect(within(roleSection).getByText("Student")).toBeInTheDocument();
      
      // Find enrollment section
      const enrollmentSection = screen.getByText("Enrollments").closest('div');
      expect(within(enrollmentSection).getByText("Test Course Enrollment")).toBeInTheDocument();
      expect(within(enrollmentSection).getByText("Progress: 50%")).toBeInTheDocument();
      
      // Find purchase history section
      const purchaseSection = screen.getByText("Purchase History").closest('div');
      expect(within(purchaseSection).getByText("Test Course Purchase")).toBeInTheDocument();
      expect(within(purchaseSection).getByText("Amount: $49.99")).toBeInTheDocument();
      expect(within(purchaseSection).getByText("completed")).toBeInTheDocument();
    });
  });

  it("allows changing user role", async () => {
    const updateUserRole = require("@/app/lib/api/profiles").updateUserRole;
    updateUserRole.mockResolvedValue({ success: true });

    render(<AdminUsersPage />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click on a user row
    fireEvent.click(screen.getByText("John Doe"));

    // Wait for user details
    await waitFor(() => {
      expect(screen.getByText("User Details")).toBeInTheDocument();
    });

    // Change role to creator
    const roleSelect = screen.getByLabelText("Change role");
    fireEvent.change(roleSelect, { target: { value: "creator" } });
    
    // Click save button
    fireEvent.click(screen.getByText("Update Role"));

    // Should call updateUserRole
    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith("1", "creator");
    });
  });
}); 
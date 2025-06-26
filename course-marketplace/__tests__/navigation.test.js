import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "../app/lib/AuthProvider";
import Navigation from "../app/components/Navigation";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("../app/lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("Navigation Component", () => {
  const mockSignOut = jest.fn();
  const mockProfile = {
    id: "user123",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    role: "student",
    email: "john@example.com",
  };

  beforeEach(() => {
    mockSignOut.mockClear();
  });

  describe("When user is not authenticated", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        profile: null,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });
    });

    test("renders navigation with login and signup buttons", () => {
      render(<Navigation />);

      expect(screen.getByText("CourseMarket")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search for anything")
      ).toBeInTheDocument();
      expect(screen.getByText("Courses")).toBeInTheDocument();
      expect(screen.queryByText("My Learning")).not.toBeInTheDocument();
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Log in")).toBeInTheDocument();
      expect(screen.getByText("Sign up")).toBeInTheDocument();
    });

    test("does not render profile component", () => {
      render(<Navigation />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
    });

    test("search bar is functional", () => {
      render(<Navigation />);

      const searchInput = screen.getByPlaceholderText("Search for anything");
      fireEvent.change(searchInput, { target: { value: "React course" } });

      expect(searchInput.value).toBe("React course");
    });
  });

  describe("When user is authenticated", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: mockProfile,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });
    });

    test("renders profile component instead of auth buttons", () => {
      render(<Navigation />);

      // Should show profile info
      expect(screen.getByText("John Doe")).toBeInTheDocument();

      // Should not show login/signup buttons
      expect(screen.queryByText("Log in")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
    });

    test("profile dropdown shows user information", async () => {
      render(<Navigation />);

      // Click on profile name to open dropdown
      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeInTheDocument();
        // Use getAllByText to handle multiple Dashboard links and check the dropdown one
        const myLearningLinks = screen.getAllByText("My Learning");
        expect(myLearningLinks.length).toBeGreaterThan(0);
        expect(screen.getByText("Sign out")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("Role: student")).toBeInTheDocument();
      });
    });

    test("profile dropdown shows admin link for admin users", async () => {
      const adminProfile = { ...mockProfile, role: "admin" };
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: adminProfile,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => true,
        isInstructor: () => true,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("My Courses")).toBeInTheDocument();
        expect(screen.getByText("Role: admin")).toBeInTheDocument();
      });
    });

    test("profile dropdown shows instructor link for instructor users", async () => {
      const instructorProfile = { ...mockProfile, role: "instructor" };
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: instructorProfile,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => true,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("My Courses")).toBeInTheDocument();
        expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
        expect(screen.getByText("Role: instructor")).toBeInTheDocument();
      });
    });

    test("sign out functionality works and redirects to landing page", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });
      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        const signOutButton = screen.getByText("Sign out");
        expect(signOutButton).not.toBeDisabled();
        fireEvent.click(signOutButton);
      });

      expect(mockSignOut).toHaveBeenCalled();
      // After sign out, should redirect to landing page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    test("sign out button shows loading state when clicked", async () => {
      // Mock a delayed sign out function
      const delayedSignOut = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });
      
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: mockProfile,
        loading: false,
        signOut: delayedSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      // Click sign out button
      const signOutButton = screen.getByText("Sign out");
      fireEvent.click(signOutButton);

      // Check that button shows loading state
      await waitFor(() => {
        expect(screen.getByText("Signing out...")).toBeInTheDocument();
        expect(signOutButton).toBeDisabled();
      });

      // Wait for sign out to complete
      await waitFor(() => {
        expect(delayedSignOut).toHaveBeenCalled();
      });
    });

    test("sign out button is disabled during sign out process", async () => {
      // Mock a delayed sign out function
      const delayedSignOut = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });
      
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: mockProfile,
        loading: false,
        signOut: delayedSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      // Click sign out button
      const signOutButton = screen.getByText("Sign out");
      fireEvent.click(signOutButton);

      // Try clicking again - should be prevented
      fireEvent.click(signOutButton);

      // Verify sign out was only called once despite multiple clicks
      await waitFor(() => {
        expect(delayedSignOut).toHaveBeenCalledTimes(1);
      });
    });

    test("shows login and signup buttons after sign out", async () => {
      // Simulate user is logged in, then logs out
      let currentUser = { id: "user123", email: "john@example.com" };
      let currentProfile = mockProfile;
      useAuth.mockImplementation(() => ({
        user: currentUser,
        profile: currentProfile,
        loading: false,
        signOut: async () => {
          currentUser = null;
          currentProfile = null;
        },
        isAdmin: () => false,
        isInstructor: () => false,
      }));

      const { rerender } = render(<Navigation />);
      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        const signOutButton = screen.getByText("Sign out");
        fireEvent.click(signOutButton);
      });

      // Update the mock to simulate logged out state
      useAuth.mockImplementation(() => ({
        user: null,
        profile: null,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      }));

      // Re-render with the new state
      rerender(<Navigation />);

      // Use getAllByText to handle potential duplicates and check that login/signup are present
      const loginLinks = screen.getAllByText("Log in");
      const signupLinks = screen.getAllByText("Sign up");
      expect(loginLinks.length).toBeGreaterThan(0);
      expect(signupLinks.length).toBeGreaterThan(0);
    });

    test("profile dropdown closes when clicking outside", async () => {
      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeInTheDocument();
      });

      // Click outside the dropdown - use a more specific target
      const navElement = screen.getByRole("navigation");
      fireEvent.mouseDown(navElement);

      await waitFor(() => {
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      });
    });

    test("profile dropdown closes when pressing escape key", async () => {
      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeInTheDocument();
      });

      // Press escape key
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      });
    });
  });

  describe("When authentication is loading", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        profile: null,
        loading: true,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });
    });

    test("shows loading state", () => {
      render(<Navigation />);

      // Should show skeleton or loading indicator
      expect(screen.getByText("CourseMarket")).toBeInTheDocument();
      // Auth buttons should not be visible during loading
      expect(screen.queryByText("Log in")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
    });
  });

  describe("Profile component edge cases", () => {
    test("handles missing profile data gracefully", () => {
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: null,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });

      render(<Navigation />);

      // Should show email as fallback
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    test("handles profile with only email", () => {
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: { email: "john@example.com" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });

      render(<Navigation />);

      // Should show email as display name
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    test("handles profile with only first name", () => {
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: { first_name: "John", email: "john@example.com" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });

      render(<Navigation />);

      // Should show first name
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        profile: null,
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false,
      });
    });

    test("all navigation links are present and accessible", () => {
      render(<Navigation />);

      const links = [
        { text: "Courses", href: "/courses" },
        { text: "Contact", href: "/contact" },
        { text: "Log in", href: "/login" },
        { text: "Sign up", href: "/signup" },
      ];

      links.forEach(({ text, href }) => {
        const link = screen.getByText(text);
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", href);
      });
    });

    test("logo links to home page", () => {
      render(<Navigation />);

      const logo = screen.getByText("CourseMarket");
      expect(logo.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Role-based navigation", () => {
    test("students should not see admin link in main navigation", () => {
      useAuth.mockReturnValue({
        user: { id: "user123", email: "student@example.com" },
        profile: { ...mockProfile, role: "student" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false
      });

      render(<Navigation />);
      
      // The Admin link should not be visible in the main navigation for students
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.getByText("My Learning")).toBeInTheDocument();
      expect(screen.queryByText("Teach")).not.toBeInTheDocument();
    });
    
    test("admins should see admin link in main navigation", () => {
      useAuth.mockReturnValue({
        user: { id: "admin123", email: "admin@example.com" },
        profile: { ...mockProfile, role: "admin" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => true,
        isInstructor: () => true
      });

      render(<Navigation />);
      
      // Admin link should be visible in the main navigation for admins
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("My Learning")).toBeInTheDocument();
      expect(screen.getByText("Teach")).toBeInTheDocument();
    });

    test("instructors should see relevant teaching links", () => {
      useAuth.mockReturnValue({
        user: { id: "instructor123", email: "instructor@example.com" },
        profile: { ...mockProfile, role: "instructor" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => true
      });

      render(<Navigation />);
      
      // Instructor should see a 'Teach' link in main navigation
      expect(screen.getByText("Teach")).toBeInTheDocument();
      expect(screen.getByText("My Learning")).toBeInTheDocument();
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });

    test("students should see student-specific navigation links", () => {
      useAuth.mockReturnValue({
        user: { id: "student123", email: "student@example.com" },
        profile: { ...mockProfile, role: "student" },
        loading: false,
        signOut: mockSignOut,
        isAdmin: () => false,
        isInstructor: () => false
      });

      render(<Navigation />);
      
      // Student should see 'My Learning' in the navigation
      expect(screen.getByText("My Learning")).toBeInTheDocument();
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.queryByText("Teach")).not.toBeInTheDocument();
    });
  });
});

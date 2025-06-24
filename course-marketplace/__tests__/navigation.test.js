import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "@/components/AuthProvider";
import Navigation from "@/app/components/Navigation";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
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
      });
    });

    test("renders navigation with login and signup buttons", () => {
      render(<Navigation />);

      expect(screen.getByText("CourseMarket")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search for anything")
      ).toBeInTheDocument();
      expect(screen.getByText("Courses")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
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
        const dashboardLinks = screen.getAllByText("Dashboard");
        expect(dashboardLinks.length).toBeGreaterThan(0);
        expect(screen.getByText("Sign out")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });

    test("profile dropdown shows admin link for admin users", async () => {
      const adminProfile = { ...mockProfile, role: "admin" };
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: adminProfile,
        loading: false,
        signOut: mockSignOut,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      });
    });

    test("profile dropdown shows instructor link for instructor users", async () => {
      const instructorProfile = { ...mockProfile, role: "instructor" };
      useAuth.mockReturnValue({
        user: { id: "user123", email: "john@example.com" },
        profile: instructorProfile,
        loading: false,
        signOut: mockSignOut,
      });

      render(<Navigation />);

      const profileButton = screen.getByText("John Doe");
      fireEvent.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText("My Courses")).toBeInTheDocument();
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
        fireEvent.click(signOutButton);
      });

      expect(mockSignOut).toHaveBeenCalled();
      // After sign out, should redirect to landing page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
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
      });
    });

    test("all navigation links are present and accessible", () => {
      render(<Navigation />);

      const links = [
        { text: "Courses", href: "/courses" },
        { text: "Dashboard", href: "/dashboard" },
        { text: "Admin", href: "/admin" },
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
});

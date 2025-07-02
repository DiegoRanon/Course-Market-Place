import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthProvider";
import AdminLayout from "@/app/admin/layout";
import "@testing-library/jest-dom";

// Mock the AuthProvider
jest.mock("@/app/lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Admin Layout", () => {
  const mockUser = { id: "123", email: "admin@example.com" };
  const mockProfile = { role: "admin" };
  const mockPush = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
    });
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it("renders the admin sidebar with all navigation links", () => {
    render(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>
    );

    // Check for main navigation sections
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders child content", () => {
    render(
      <AdminLayout>
        <div data-testid="test-content">Test content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("redirects non-admin users", () => {
    useAuth.mockReturnValue({
      user: mockUser,
      profile: { role: "student" },
      loading: false,
    });

    render(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>
    );

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows loading state when auth is loading", () => {
    useAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
    });

    render(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
}); 
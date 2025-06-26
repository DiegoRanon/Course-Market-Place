import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter } from "next/navigation";
import Login from "@/app/login/page";
import "@testing-library/jest-dom";

jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Login Page", () => {
  const mockSignIn = jest.fn();
  const mockUser = null;
  const mockLoading = false;
  const mockPush = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      loading: mockLoading,
      signIn: mockSignIn,
    });
    useRouter.mockReturnValue({ push: mockPush });
    mockSignIn.mockClear();
    mockPush.mockClear();
  });

  test("renders login form", () => {
    render(<Login />);
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in with Google" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in with GitHub" })
    ).toBeInTheDocument();
  });

  test("shows validation errors for empty fields", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "" },
    });
    const submitButton = screen.getByRole("button", { name: "Sign in" });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(
      await screen.findByText((t) => t.includes("Email is required"))
    ).toBeInTheDocument();
    expect(
      await screen.findByText((t) => t.includes("Password is required"))
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid email", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "invalid-email" },
    });
    fireEvent.blur(screen.getByLabelText("Email address"));
    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument();
    });
  });

  test("calls signIn and redirects on successful login", async () => {
    mockSignIn.mockResolvedValue({ user: { id: "123" } });
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error on failed login", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("shows loading state during login", async () => {
    let resolveLogin;
    mockSignIn.mockImplementation(
      () =>
        new Promise((res) => {
          resolveLogin = res;
        })
    );
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
    resolveLogin({ user: { id: "123" } });
  });

  test("redirects to dashboard if already authenticated", () => {
    useAuth.mockReturnValue({
      user: { id: "123" },
      loading: false,
      signIn: mockSignIn,
    });
    render(<Login />);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  test("calls social login for Google", () => {
    render(<Login />);
    const googleButton = screen.getByRole("button", {
      name: "Sign in with Google",
    });
    fireEvent.click(googleButton);
    expect(mockSignIn).toHaveBeenCalledWith("google");
  });

  test("calls social login for GitHub", () => {
    render(<Login />);
    const githubButton = screen.getByRole("button", {
      name: "Sign in with GitHub",
    });
    fireEvent.click(githubButton);
    expect(mockSignIn).toHaveBeenCalledWith("github");
  });
});

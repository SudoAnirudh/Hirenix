import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock next/navigation
const mockReplace = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));

// Mock @/lib/auth
const mockSignIn = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("@/lib/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  sendPasswordResetEmail: (...args: unknown[]) =>
    mockSendPasswordResetEmail(...args),
  getSession: (...args: unknown[]) => mockGetSession(...args),
  onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
}));

function setupDefaultMocks() {
  mockGetSession.mockResolvedValue(null);
  mockOnAuthStateChange.mockReturnValue({ unsubscribe: vi.fn() });
  mockSignIn.mockResolvedValue({ error: null });
  mockSendPasswordResetEmail.mockResolvedValue({ error: null });
}

async function renderAndWaitForForm() {
  const result = render(<LoginPage />);
  // Wait for session check to complete and the form to appear
  await waitFor(() => {
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  setupDefaultMocks();
});

// ---------------------------------------------------------------------------
// Submit button loading state (PR change: Loader2 spinner + "Signing in...")
// ---------------------------------------------------------------------------
describe("Login submit button loading state", () => {
  it("shows 'Sign In' text when not loading", async () => {
    await renderAndWaitForForm();
    const btn = screen.getByRole("button", { name: /sign in/i });
    expect(btn).toHaveTextContent("Sign In");
  });

  it("shows 'Signing in...' text while the sign-in request is in flight", async () => {
    // Keep signIn pending so we can observe the loading state
    let resolveSignIn!: (v: { error: null }) => void;
    mockSignIn.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignIn = res;
      }),
    );

    await renderAndWaitForForm();

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i, { selector: "input" }), "secret123");

    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    // Cleanup – resolve the pending promise
    act(() => resolveSignIn({ error: null }));
  });

  it("renders the Loader2 spinner while signing in", async () => {
    let resolveSignIn!: (v: { error: null }) => void;
    mockSignIn.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignIn = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i, { selector: "input" }), "pass");

    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    await waitFor(() => {
      // Loader2 renders an SVG; check for the animate-spin class added in the PR
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    act(() => resolveSignIn({ error: null }));
  });

  it("disables the submit button while loading", async () => {
    let resolveSignIn!: (v: { error: null }) => void;
    mockSignIn.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignIn = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i, { selector: "input" }), "pass");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.submit(submitBtn.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    // After loading starts the button (now labelled "Signing in...") should be disabled
    const loadingBtn = screen.getByRole("button", { name: /signing in/i });
    expect(loadingBtn).toBeDisabled();

    act(() => resolveSignIn({ error: null }));
  });

  it("does not render the Loader2 spinner when not loading", async () => {
    await renderAndWaitForForm();
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Forgot-password button loading state (PR change: Loader2 + "Sending...")
// ---------------------------------------------------------------------------
describe("Forgot-password button loading state", () => {
  it("shows 'Forgot password?' text by default", async () => {
    await renderAndWaitForForm();
    expect(
      screen.getByRole("button", { name: /forgot password\?/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Sending...' while the reset request is in flight", async () => {
    let resolveReset!: (v: { error: null }) => void;
    mockSendPasswordResetEmail.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveReset = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");

    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));

    await waitFor(() => {
      expect(screen.getByText("Sending...")).toBeInTheDocument();
    });

    act(() => resolveReset({ error: null }));
  });

  it("renders the Loader2 spinner while sending the reset email", async () => {
    let resolveReset!: (v: { error: null }) => void;
    mockSendPasswordResetEmail.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveReset = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");

    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));

    await waitFor(() => {
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    act(() => resolveReset({ error: null }));
  });

  it("disables the forgot-password button while sending", async () => {
    let resolveReset!: (v: { error: null }) => void;
    mockSendPasswordResetEmail.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveReset = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");

    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));

    await waitFor(() => {
      // Once loading, the button text changes to "Sending..."
      const btn = screen.getByRole("button", { name: /sending/i });
      expect(btn).toBeDisabled();
    });

    act(() => resolveReset({ error: null }));
  });

  it("reverts to 'Forgot password?' after the reset email is sent", async () => {
    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");

    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /forgot password\?/i }),
      ).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Password-toggle button accessibility attributes (PR change: aria-label, aria-pressed)
// ---------------------------------------------------------------------------
describe("Password visibility toggle accessibility", () => {
  it("has aria-label='Show password' when password is hidden", async () => {
    await renderAndWaitForForm();
    const toggleBtn = screen.getByRole("button", { name: "Show password" });
    expect(toggleBtn).toBeInTheDocument();
  });

  it("has aria-pressed='false' when password is hidden", async () => {
    await renderAndWaitForForm();
    const toggleBtn = screen.getByRole("button", { name: "Show password" });
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("changes aria-label to 'Hide password' after clicking the toggle", async () => {
    await renderAndWaitForForm();
    const toggleBtn = screen.getByRole("button", { name: "Show password" });

    await userEvent.click(toggleBtn);

    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });

  it("sets aria-pressed='true' after clicking the toggle", async () => {
    await renderAndWaitForForm();
    const toggleBtn = screen.getByRole("button", { name: "Show password" });

    await userEvent.click(toggleBtn);

    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles aria-label back to 'Show password' on second click", async () => {
    await renderAndWaitForForm();
    const toggleBtn = screen.getByRole("button", { name: "Show password" });

    await userEvent.click(toggleBtn);
    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("changes password input type from 'password' to 'text' when toggled", async () => {
    await renderAndWaitForForm();

    const passwordInput = screen.getByLabelText(/password/i, { selector: "input" });
    expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("changes password input type back to 'password' on second toggle click", async () => {
    await renderAndWaitForForm();
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));

    const passwordInput = screen.getByLabelText(/password/i, { selector: "input" });
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
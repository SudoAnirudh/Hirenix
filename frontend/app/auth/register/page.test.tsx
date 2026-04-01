import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";

// Mock next/link (used in the component but not under test here)
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock @/lib/auth
const mockSignUp = vi.fn();
vi.mock("@/lib/auth", () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
}));

function setupDefaultMocks() {
  mockSignUp.mockResolvedValue({ error: null });
}

async function renderAndWaitForForm() {
  const result = render(<RegisterPage />);
  // The register page renders immediately (no session check), but wait for form
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: /create free account/i }),
    ).toBeInTheDocument();
  });
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  setupDefaultMocks();
});

// ---------------------------------------------------------------------------
// Submit button loading state (PR change: Loader2 spinner + "Creating account...")
// ---------------------------------------------------------------------------
describe("Register submit button loading state", () => {
  it("shows 'Create Free Account' text when not loading", async () => {
    await renderAndWaitForForm();
    expect(
      screen.getByRole("button", { name: /create free account/i }),
    ).toHaveTextContent("Create Free Account");
  });

  it("shows 'Creating account...' text while the sign-up request is in flight", async () => {
    let resolveSignUp!: (v: { error: null }) => void;
    mockSignUp.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignUp = res;
      }),
    );

    await renderAndWaitForForm();

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    fireEvent.submit(
      screen
        .getByRole("button", { name: /create free account/i })
        .closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });

    // Cleanup
    act(() => resolveSignUp({ error: null }));
  });

  it("renders the Loader2 spinner while creating the account", async () => {
    let resolveSignUp!: (v: { error: null }) => void;
    mockSignUp.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignUp = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    fireEvent.submit(
      screen
        .getByRole("button", { name: /create free account/i })
        .closest("form")!,
    );

    await waitFor(() => {
      // Loader2 renders an SVG with animate-spin class added by the PR
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    act(() => resolveSignUp({ error: null }));
  });

  it("disables the submit button while loading", async () => {
    let resolveSignUp!: (v: { error: null }) => void;
    mockSignUp.mockReturnValue(
      new Promise<{ error: null }>((res) => {
        resolveSignUp = res;
      }),
    );

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    const submitBtn = screen.getByRole("button", { name: /create free account/i });
    fireEvent.submit(submitBtn.closest("form")!);

    await waitFor(() => {
      const loadingBtn = screen.getByRole("button", { name: /creating account/i });
      expect(loadingBtn).toBeDisabled();
    });

    act(() => resolveSignUp({ error: null }));
  });

  it("does not render the Loader2 spinner when not loading", async () => {
    await renderAndWaitForForm();
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).not.toBeInTheDocument();
  });

  it("submit button is enabled (not disabled) when not loading", async () => {
    await renderAndWaitForForm();
    const btn = screen.getByRole("button", { name: /create free account/i });
    expect(btn).not.toBeDisabled();
  });

  it("re-enables the submit button after a sign-up error", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Email already in use" } });

    await renderAndWaitForForm();
    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    fireEvent.submit(
      screen
        .getByRole("button", { name: /create free account/i })
        .closest("form")!,
    );

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });

    // Button should be re-enabled after error
    const btn = screen.getByRole("button", { name: /create free account/i });
    expect(btn).not.toBeDisabled();
  });
});
jest.mock("@/hooks/auth/useLogin");
jest.mock("@/hooks/auth/useRegister");
jest.mock("@/hooks/auth/useVerifyEmail");
jest.mock("@/hooks/auth/useResendCode");
jest.mock("@/hooks/auth/useAuth");
jest.mock("@/hooks/use-toast", () => ({ toast: jest.fn() }));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "@/hooks/use-toast";
import { useAuth, useLogin, useVerifyEmail } from "@/__mocks__/authHooks";
import { AuthDialog } from "../auth-dialog";

jest.mock("@/hooks/auth/useLogin");
jest.mock("@/hooks/auth/useAuth");
jest.mock("@/hooks/auth/useVerifyEmail");
jest.mock("@/hooks/auth/useRegister");
jest.mock("@/hooks/auth/useResendCode");
jest.mock("@/hooks/use-toast");

describe("AuthDialog", () => {
  const onOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: null });
  });

  it("shows email and password fields for login", () => {
    render(<AuthDialog open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("validates empty credentials on submit", async () => {
    render(<AuthDialog open={true} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("calls login and opens verification step when email not verified", async () => {
    const mutate = jest.fn((_, { onSuccess }) =>
      onSuccess({ isEmailVerified: false })
    );
    (useLogin as jest.Mock).mockReturnValue({ mutate, isPending: false });
    render(<AuthDialog open={true} onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Registration successful" })
    );
  });

  it("shows error on login failure", async () => {
    const mutate = jest.fn((_, { onError }) =>
      onError({ response: { data: { error: "bad creds" } } })
    );
    (useLogin as jest.Mock).mockReturnValue({ mutate, isPending: false });
    render(<AuthDialog open={true} onOpenChange={onOpenChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });

  it("verifies email when code is entered", async () => {
    (useLogin as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    (useVerifyEmail as jest.Mock).mockReturnValue({
      mutate: (_payload: any, { onSuccess }: { onSuccess: () => void }) =>
        onSuccess(),
      isPending: false,
    });

    render(<AuthDialog open={true} onOpenChange={onOpenChange} />);
  });
});

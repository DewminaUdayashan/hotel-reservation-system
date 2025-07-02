"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin } from "@/hooks/auth/useLogin";
import { useRegister } from "@/hooks/auth/useRegister";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useResendCode } from "@/hooks/auth/useResendCode";
import { useAuth } from "@/hooks/auth/useAuth";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { z } from "zod";
import { Checkbox } from "../ui/checkbox";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type AuthStep = "auth" | "verify-email" | "password-reset";

const loginSchema = z.object({
  email: z.string().email({ message: "Email is invalid" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess: onSuccessCallback,
}: AuthDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [currentStep, setCurrentStep] = useState<AuthStep>("auth");
  const [verificationCode, setVerificationCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [resendCoolDown, setResendCoolDown] = useState(0);
  const [isAgency, setIsAgency] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    homeTown: "",
    confirmPassword: "",
    agencyName: "",
    agencyPhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const resendMutation = useResendCode();
  const verifyEmailMutation = useVerifyEmail();

  const registerSchema = z
    .object({
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      email: z.string().email({ message: "Email is invalid" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
      phone: z
        .string()
        .min(1, { message: "Phone is required" })
        .regex(/^\+?\d{10,15}$/, {
          message: "Phone number must be 10 to 15 digits (with optional +)",
        }),
      homeTown: z.string().optional(),
      confirmPassword: z.string().optional(),
      agencyName: z.string().optional(),
      agencyPhone: z.string().optional(),
    })
    .refine(
      (data) => !data.confirmPassword || data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    )
    .superRefine((data, ctx) => {
      if (isAgency) {
        if (!data.agencyName) {
          ctx.addIssue({
            path: ["agencyName"],
            code: z.ZodIssueCode.custom,
            message: "Agency name is required",
          });
        }
        if (!data.agencyPhone || !/^\+?\d{10,15}$/.test(data.agencyPhone)) {
          ctx.addIssue({
            path: ["agencyPhone"],
            code: z.ZodIssueCode.custom,
            message:
              "Agency phone must be 10 to 15 digits (with optional + at the start)",
          });
        }
      }
    });

  // Start cool down timer for resend button
  const startResendCoolDown = () => {
    setResendCoolDown(60);
    const timer = setInterval(() => {
      setResendCoolDown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only numbers and one optional + at the beginning
      let cleaned = value.replace(/[^\d+]/g, "");

      // Only allow leading +
      if (cleaned.includes("+")) {
        cleaned = "+" + cleaned.replace(/\+/g, "").replace(/\D/g, "");
      } else {
        cleaned = cleaned.replace(/\D/g, "");
      }

      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let result;
    if (activeTab === "login") {
      result = loginSchema.safeParse({
        email: formData.email,
        password: formData.password,
      });
    } else {
      result = registerSchema.safeParse(formData);
    }

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (activeTab === "login") {
      await loginMutation.mutate(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          onSuccess: (data) => {
            if (!data.isEmailVerified) {
              setUserEmail(formData.email);
              setCurrentStep("verify-email");
              startResendCoolDown();

              toast({
                title: "Registration successful",
                description: "Please check your email for a verification code.",
              });
              return;
            }
            if (data.mustResetPassword) {
              setCurrentStep("password-reset");
              toast({
                title: "Password reset required",
                description: "Please reset your password before logging in.",
              });
              return;
            }
            onOpenChange(false);
            if (onSuccessCallback) onSuccessCallback();
          },
          onError: (error: any) => {
            const errorMessage =
              error.response.data.error || "Failed to login.";

            setErrors((prev) => ({ ...prev, password: errorMessage }));
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      await registerMutation.mutate(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          homeTown: formData.homeTown,
          role: "customer",
          agencyName: isAgency ? formData.agencyName : undefined,
          agencyPhone: isAgency ? formData.agencyPhone : undefined,
        },
        {
          onSuccess: (data) => {
            if (!data.isEmailVerified) {
              setUserEmail(formData.email);
              setCurrentStep("verify-email");
              startResendCoolDown();

              toast({
                title: "Registration successful",
                description: "Please check your email for a verification code.",
              });
              return;
            }
            if (data.mustResetPassword) {
              setCurrentStep("password-reset");
              toast({
                title: "Password reset required",
                description: "Please reset your password before logging in.",
              });
              return;
            }
            onOpenChange(false);
            if (onSuccessCallback) onSuccessCallback();
          },
          onError(error: any) {
            console.error("Registration error:", error);
            const errorMessage =
              error.response?.data?.error ||
              error.message ||
              "Registration failed.";

            setErrors((prev) => ({ ...prev, email: errorMessage }));
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmailMutation.mutate(
      { email: userEmail, token: verificationCode },
      {
        onSuccess: () => {
          toast({
            title: "Email verified",
            description: "Please log in to continue.",
          });
          resetDialog();
        },
        onError: (error: any) => {
          let errorMessage =
            error.response.data.error || "Failed to verify email.";
          console.error("Email verification error:", errorMessage);
          if (
            errorMessage.includes(
              "Error converting data type nvarchar to uniqueidentifier"
            )
          ) {
            errorMessage =
              "Invalid verification code. Please check your email and try again.";
          }
          setErrors((prev) => ({ ...prev, verificationCode: errorMessage }));
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleResendCode = async () => {
    resendMutation.mutate(
      { email: userEmail, user: user?.firstName ?? "there!" },
      {
        onSuccess: () => {
          toast({
            title: "Verification code sent",
            description:
              "Please check your email for the new verification code.",
          });
          startResendCoolDown();
        },
      }
    );
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const resetDialog = () => {
    setCurrentStep("auth");
    setActiveTab("login");
    setVerificationCode("");
    setUserEmail("");
    setIsAgency;
    setErrors({});
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      homeTown: "",
      confirmPassword: "",
      agencyName: "",
      agencyPhone: "",
    });
  };
  // Email Verification Step
  if (currentStep === "verify-email") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a verification token to{" "}
              <span className="font-medium text-foreground">{userEmail}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                placeholder="Enter verification token"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setVerificationCode(value);
                  if (errors.verificationCode) {
                    setErrors((prev) => ({ ...prev, verificationCode: "" }));
                  }
                }}
                className="text-center text-lg tracking-widest"
              />
              {errors.verificationCode && (
                <p className="text-sm text-red-500">
                  {errors.verificationCode}
                </p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Didn't receive the code? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCoolDown > 0 || resendMutation.isPending}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                >
                  {resendCoolDown > 0
                    ? `resend in ${resendCoolDown}s`
                    : resendMutation.isPending
                      ? "resending..."
                      : "resend code"}
                </button>
              </AlertDescription>
            </Alert>

            <DialogFooter className="flex-col space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={!verificationCode || verifyEmailMutation.isPending}
                onClick={handleVerifyEmail}
              >
                {verifyEmailMutation.isPending
                  ? "Verifying..."
                  : "Verify Email"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={resetDialog}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Password Reset Step
  if (currentStep === "password-reset") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <DialogTitle className="text-center">
              Password Reset Required
            </DialogTitle>
            <DialogDescription className="text-center">
              For security reasons, you need to reset your password before
              accessing your account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your password must be at least 6 characters long and contain a
                mix of letters and numbers for security.
              </AlertDescription>
            </Alert>

            <DialogFooter className="flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={false}>
                {false ? "Resetting Password..." : "Reset Password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={resetDialog}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Main Authentication Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 py-4">
              <DialogHeader>
                <DialogTitle>Login to your account</DialogTitle>
                <DialogDescription>
                  Enter your email and password to access your reservations.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4 py-4">
              <DialogHeader>
                <DialogTitle>Create an account</DialogTitle>
                <DialogDescription>
                  Register to manage your reservations and get special offers.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input
                    id="email-register"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <Input
                    id="password-register"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeTown">Hometown (optional)</Label>
                  <Input
                    id="homeTown"
                    name="homeTown"
                    placeholder="City, State"
                    value={formData.homeTown}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAgency"
                    checked={isAgency}
                    onCheckedChange={(checked) => setIsAgency(checked === true)}
                  />
                  <Label htmlFor="isAgency">Registering as an Agency</Label>
                </div>

                {isAgency && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">Agency Name</Label>
                      <Input
                        id="agencyName"
                        name="agencyName"
                        placeholder="Awesome Travels"
                        value={formData.agencyName}
                        onChange={handleChange}
                      />
                      {errors.agencyName && (
                        <p className="text-sm text-red-500">
                          {errors.agencyName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agencyPhone">Agency Phone</Label>
                      <Input
                        id="agencyPhone"
                        name="agencyPhone"
                        placeholder="+1234567890"
                        value={formData.agencyPhone}
                        onChange={handleChange}
                      />
                      {errors.agencyPhone && (
                        <p className="text-sm text-red-500">
                          {errors.agencyPhone}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? "Creating account..."
                    : "Register"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useAuth } from "@/hooks/auth/useAuth";

export const UserOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();

  if (!user || isAdmin || !user.isEmailVerified || user.mustResetPassword) {
    return null;
  }
  return <>{children}</>;
};

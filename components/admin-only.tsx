import { useAuth } from "@/hooks/auth/useAuth";

export const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return null;
  }
  return <>{children}</>;
};

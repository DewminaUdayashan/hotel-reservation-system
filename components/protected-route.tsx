import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (requireAdmin && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [user]);

  if (!user) return null;

  return <>{children}</>;
};

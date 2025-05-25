import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isAdmin) return;
    if (requireAdmin && !isAdmin) {
      router.push("/");
    }
  }, [user]);

  if (!user) return null;

  return <>{children}</>;
};

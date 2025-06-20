import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/");
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return null;
  }
  return <>{children}</>;
};

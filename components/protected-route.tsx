import { useAuth } from "@/hooks/auth/useAuth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { user, isAdmin } = useAuth();

  // useEffect(() => {
  //   if (!user && !isAdmin) redirect("/");

  //   if (requireAdmin && !isAdmin) {
  //     redirect("/");
  //   }
  // }, [user]);

  // if (!user) redirect("/");

  return <>{children}</>;
};

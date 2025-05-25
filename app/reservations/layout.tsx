"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useAuth();
  useEffect(() => {
    if (isAdmin) {
      redirect("/admin/reservations");
    }
  }, [user, isAdmin]);
  return children;
}

"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Loading() {
  const { user, isAdmin } = useAuth();
  useEffect(() => {
    if (isAdmin) {
      redirect("/admin/reservations");
    }
  }, [user, isAdmin]);
  return null;
}

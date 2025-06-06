"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import DashboardPage from "./dashboard/page";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) {
      redirect("/home");
    }
  }, [user, isAdmin]);
  if (!user || !isAdmin) {
    return null; // or a loading state
  }
  return <DashboardPage />;
}

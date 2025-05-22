import type React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "LuxeStay Hotels - Hotel Reservation System",
  description: "A comprehensive hotel reservation system for LuxeStay Hotels",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

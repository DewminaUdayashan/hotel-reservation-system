"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Hotel,
  LogOut,
  Menu,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/hooks/auth/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{
    [label: string]: boolean;
  }>({});
  const pathname = usePathname();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/reservations", label: "Reservations", icon: Calendar },
    { href: "/admin/hotels", label: "Hotels", icon: Building },
    { href: "/admin/rooms", label: "Rooms", icon: Building2 },
    ...(isSuperAdmin
      ? [
          {
            label: "People",
            icon: Users,
            children: [
              { href: "/admin/users", label: "Users" },
              { href: "/admin/customers", label: "Customers" },
            ],
          },
          { href: "/admin/reports", label: "Reports", icon: FileText },
          { href: "/admin/billing", label: "Billing", icon: CreditCard },
        ]
      : []),
    ...(!isSuperAdmin
      ? [{ href: "/admin/customers", label: "Customers", icon: Users }]
      : []),
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  const renderNavItems = (isMobile = false) => (
    <nav className="grid gap-2 p-4">
      {navItems.map((item) =>
        item.children ? (
          <div key={item.label}>
            <button
              onClick={() => toggleSubmenu(item.label)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {openSubmenus[item.label] ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {openSubmenus[item.label] && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-all",
                      pathname === subItem.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      )}
    </nav>
  );

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen flex-col">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-6">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Hotel className="h-6 w-6" />
                  <span>LuxeStay Admin</span>
                </Link>
              </div>
              {renderNavItems(true)}
              <div className="mt-auto p-4">
                <Link href="/auth/logout">
                  <Button variant="outline" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Desktop Layout */}
        <div className="flex flex-1">
          <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
            {renderNavItems()}
            <div className="mt-auto p-4">
              <Link href="/auth/logout">
                <Button variant="outline" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </Link>
            </div>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

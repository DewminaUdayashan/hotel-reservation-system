import Link from "next/link";
import { Button } from "../ui/button";
import { Hotel, User } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Hotel className="h-6 w-6" />
          <span className="text-xl font-bold">LuxeStay Hotels</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Home
          </Link>
          <Link
            href="/rooms"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Rooms
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/reservations">
            <Button variant="outline" size="sm" className="hidden md:flex">
              My Reservations
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Staff Portal
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="sm">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

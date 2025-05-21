import { Hotel } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t bg-black">
      <div className="container flex flex-col gap-6 py-8 px-4 md:px-6 lg:flex-row lg:gap-12">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Hotel className="h-6 w-6" />
            <span className="text-lg font-bold">LuxeStay Hotels</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            Providing luxury accommodations and exceptional service for over 20
            years. Your home away from home.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Navigation</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm hover:underline">
                Home
              </Link>
              <Link href="/rooms" className="text-sm hover:underline">
                Rooms
              </Link>
              <Link href="/about" className="text-sm hover:underline">
                About
              </Link>
              <Link href="/contact" className="text-sm hover:underline">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Services</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm hover:underline">
                Restaurant
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Room Service
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Laundry
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Club Facility
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Cookies
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-xs text-muted-foreground">
            © 2025 LuxeStay Hotels. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

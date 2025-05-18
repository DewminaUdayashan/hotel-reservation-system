import { Suspense } from "react"
import Link from "next/link"
import { Hotel, Search, User, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { RoomShowcase } from "@/components/room-showcase"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Hotel className="h-6 w-6" />
            <span className="text-xl font-bold">LuxeStay Hotels</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/rooms" className="text-sm font-medium hover:underline underline-offset-4">
              Rooms
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
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
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
          <HeroSection />
          <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <Search className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Find Your Room</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse our selection of luxurious rooms and suites.
                </p>
                <Link href="/rooms">
                  <Button className="mt-4 w-full">View Rooms</Button>
                </Link>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Make a Reservation</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Book your stay with us for an unforgettable experience.
                </p>
                <Link href="/reservation/new">
                  <Button className="mt-4 w-full">Book Now</Button>
                </Link>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Manage Booking</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">View, modify or cancel your existing reservations.</p>
                <Link href="/reservations">
                  <Button className="mt-4 w-full">My Bookings</Button>
                </Link>
              </div>
            </div>
          </div>
          <RoomShowcase />
          <FeaturesSection />
          <TestimonialsSection />
        </Suspense>
      </main>
      <footer className="border-t bg-muted">
        <div className="container flex flex-col gap-6 py-8 px-4 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Hotel className="h-6 w-6" />
              <span className="text-lg font-bold">LuxeStay Hotels</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Providing luxury accommodations and exceptional service for over 20 years. Your home away from home.
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
            <p className="text-xs text-muted-foreground">© 2023 LuxeStay Hotels. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

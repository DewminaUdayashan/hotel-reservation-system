import { Suspense } from "react";
import Link from "next/link";
import { Search, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home/hero-section";
import { RoomShowcase } from "@/components/home/room-showcase";
import { FeaturesSection } from "@/components/home/features-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen min-w-full">
      <main className="flex-1 w-full">
        <Suspense
          fallback={<div className="container mx-auto p-4">Loading...</div>}
        >
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
                <p className="mt-2 text-sm text-muted-foreground">
                  View, modify or cancel your existing reservations.
                </p>
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
    </div>
  );
}

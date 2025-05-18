"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { RoomFilters } from "@/components/room-filters";
import { ImageCarousel } from "@/components/image-carousel";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function HeroSection() {
  const router = useRouter();

  // Use useCallback to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    router.push("/rooms");
  }, [router]);

  const carouselImages = [
    "/images/hero/1.jpg",
    "/images/hero/2.png",
    "/images/hero/4.jpg",
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative">
      <ImageCarousel
        images={carouselImages}
        className="absolute inset-0 z-0"
        aspectRatio="auto"
      />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 bg-background/80 backdrop-blur-sm p-6 rounded-lg">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Experience Luxury at LuxeStay Hotels
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Book your perfect stay with us. Enjoy premium amenities,
                exceptional service, and unforgettable experiences.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/rooms">
                <Button size="lg">View Rooms</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-2 bg-background p-4 rounded-lg shadow-lg">
              <div className="text-xl font-bold mb-4">
                Find Your Perfect Room
              </div>
              <RoomFilters
                onFilter={handleSearch}
                compact={true}
                showPriceFilter={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

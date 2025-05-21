"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { RoomTypeShowcaseCard } from "./room-showcase-card";
import { useRoomTypes } from "@/hooks/rooms/rooms";
import { Skeleton } from "../ui/skeleton";

export function RoomShowcase() {
  const { data: rooms, isLoading } = useRoomTypes();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="px-4 md:px-6 text-center">
        <div className="space-y-2 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Our Rooms & Suites
          </h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover our selection of luxurious accommodations designed for your
            comfort and relaxation.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-8">
          {isLoading && <Skeleton className="h-96 w-full bg-white/20" />}
          {isLoading && <Skeleton className="h-96 w-full bg-white/20" />}
          {isLoading && <Skeleton className="h-96 w-full bg-white/20" />}
          {isLoading && <Skeleton className="h-96 w-full bg-white/20" />}
          {!isLoading &&
            rooms &&
            rooms?.map((room) => (
              <RoomTypeShowcaseCard key={room.id} room={room} />
            ))}
        </div>
        <div className="flex justify-center">
          <Link href="/rooms">
            <Button variant="outline" size="lg">
              View All Rooms
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

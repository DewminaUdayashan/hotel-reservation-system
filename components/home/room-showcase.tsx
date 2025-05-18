"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { RoomTypeShowcaseCard } from "./room-showcase-card";
import { useRoomTypes } from "@/hooks/rooms";

export function RoomShowcase() {
  const { data: rooms } = useRoomTypes();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Our Rooms & Suites
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our selection of luxurious accommodations designed for
              your comfort and relaxation.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-8">
          {rooms &&
            rooms.map((room) => (
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

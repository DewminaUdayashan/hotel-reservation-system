"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Wifi, Coffee, Tv, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomFilters } from "@/components/room-filters";
import { useStore } from "@/lib/store";
import { rooms } from "@/lib/data";
import { RoomCard } from "@/components/room/room-card";

export default function RoomsPage() {
  const router = useRouter();
  const filters = useStore((state) => state.filters);
  const filteredRooms = rooms;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Our Rooms & Suites</h1>
      </div>

      <div className="grid gap-8">
        {/* Filters */}
        <RoomFilters />

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              No rooms match your criteria
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or dates to see more options.
            </p>
            <Button onClick={() => useStore.getState().clearFilters()}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

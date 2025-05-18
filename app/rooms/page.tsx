"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Users, Wifi, Coffee, Tv, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomFilters } from "@/components/room-filters";
import { useStore, filterRooms } from "@/lib/store";

export default function RoomsPage() {
  const router = useRouter();
  const filters = useStore((state) => state.filters);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  // Apply filters when component mounts or filters change
  useEffect(() => {
    const rooms = filterRooms(filters);
    setFilteredRooms(rooms);
  }, [filters]);

  const getFeatureIcon = (feature: string) => {
    if (feature.includes("WiFi")) return <Wifi className="h-4 w-4" />;
    if (feature.includes("Coffee")) return <Coffee className="h-4 w-4" />;
    if (feature.includes("TV")) return <Tv className="h-4 w-4" />;
    if (feature.includes("Bathroom") || feature.includes("Jacuzzi"))
      return <Bath className="h-4 w-4" />;
    return null;
  };

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
            <Card key={room.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={
                    room.images?.[0] || "/placeholder.svg?height=400&width=600"
                  }
                  alt={room.name || "Room"}
                  fill
                  className="object-cover"
                />
                {room.isResidential && (
                  <Badge className="absolute top-2 right-2 bg-primary">
                    Residential
                  </Badge>
                )}
                {!room.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">
                      Fully Booked
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Up to {room.capacity} guests
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {room.amenities?.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      {getFeatureIcon(feature)}
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold">
                    ${room.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / night
                    </span>
                  </div>
                  {room.weeklyRate && (
                    <div className="text-sm text-muted-foreground">
                      Weekly: ${room.weeklyRate}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/rooms/${room.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link
                  href={`/reservation/new?roomId=${room.id}`}
                  className="w-full ml-2"
                >
                  <Button className="w-full" disabled={!room.isAvailable}>
                    Book Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
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

"use client";

import { RoomType } from "@/lib/types/room";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  useAvailableRoomsByType,
  useRoomTypeAmenities,
  useRoomTypeImages,
} from "@/hooks/rooms/rooms";
import { getFeatureIcon } from "../room/feature-icon";
import { Skeleton } from "../ui/skeleton";
import { useStore } from "@/lib/store";

type RoomShowcaseCardProps = {
  room: RoomType;
};

export const RoomTypeShowcaseCard = ({ room }: RoomShowcaseCardProps) => {
  const router = useRouter();

  const { data: amenities, isLoading: isAmenitiesLoading } =
    useRoomTypeAmenities(room.id);
  const { data: images, isLoading: isImageLoading } = useRoomTypeImages(
    room.id
  );

  const filters = useStore((state) => state.filters);
  const checkIn = filters.checkIn;
  const checkOut = filters.checkOut;

  const { data: rooms, isLoading: isAvailableRoomsLoading } =
    useAvailableRoomsByType(
      room.id,
      checkIn?.toISOString(),
      checkOut?.toISOString()
    );

  const isUnavailable = !rooms || rooms?.length === 0;

  return (
    <Card
      key={room.id}
      className="overflow-hidden hover:shadow-sm hover:shadow-white transition-shadow duration-300 ease-in-out"
    >
      <div className="relative h-48 w-full">
        {!isImageLoading && images && (
          <Image
            src={images?.[0].url || "/placeholder.svg"}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        )}
        {(isImageLoading || !images) && (
          <Skeleton className="h-full w-full bg-white/20" />
        )}
        {room?.isResidential && (
          <Badge className="absolute top-2 right-2 bg-primary">
            Residential
          </Badge>
        )}
        {isUnavailable && !isAvailableRoomsLoading && (
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
          {amenities &&
            amenities.slice(0, 4).map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                {getFeatureIcon(feature.name)}
                <span className="text-sm">{feature.name}</span>
              </div>
            ))}
        </div>
        <div className="mt-4 flex flex-row items-center justify-between">
          <div className="text-lg font-bold">
            ${room.price}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / night
            </span>
          </div>
          <div>
            {rooms && rooms.length > 0 && (
              <span
                className={`text-sm ${
                  rooms.length < 2 ? "text-red-500" : "text-green-500"
                }`}
              >
                {rooms.length > 1 ? "" : "Only"} {rooms.length} room
                {rooms.length > 1 ? "s" : ""} available
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            router.push(`/room-types/${room.id}`);
          }}
        >
          View Details
        </Button>
        <Button
          className="w-full ml-2"
          disabled={isUnavailable}
          onClick={() => {
            router.push(`/reservation/new?roomId=${room.id}`);
          }}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

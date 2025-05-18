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
import {
  AirVentIcon,
  Bath,
  Coffee,
  Tv,
  Users,
  Wifi,
  ForkKnife,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useReservations } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAvailableRoomsByType } from "@/hooks/rooms";
import { getFeatureIcon } from "../room/feature-icon";

type RoomShowcaseCardProps = {
  room: RoomType;
};

export const RoomTypeShowcaseCard = ({ room }: RoomShowcaseCardProps) => {
  const router = useRouter();
  const { data: rooms } = useAvailableRoomsByType({
    roomType: room.id,
    availableOnly: true,
  });

  const isUnavailable = !rooms || rooms?.length === 0;

  return (
    <Card key={room.id} className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={room.images?.[0] || "/placeholder.svg"}
          alt={room.name}
          fill
          className="object-cover"
        />
        {room?.isResidential && (
          <Badge className="absolute top-2 right-2 bg-primary">
            Residential
          </Badge>
        )}
        {isUnavailable && (
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
          {room.amenities.slice(0, 4).map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              {getFeatureIcon(feature)}
              <span className="text-sm">{feature}</span>
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

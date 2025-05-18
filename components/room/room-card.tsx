import { Room } from "@/lib/types/room";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { useRoomTypeById } from "@/hooks/rooms";
import { getFeatureIcon } from "./feature-icon";
import { useRouter } from "next/navigation";
import { RoomTypeBadge } from "./room-type-badge";
import { ImageCarousel } from "../image-carousel";

type Props = {
  room: Room;
};

export const RoomCard = ({ room }: Props) => {
  const { data: roomType } = useRoomTypeById(room.type);
  const router = useRouter();
  return (
    <Card
      key={room.id}
      className="overflow-hidden hover:shadow-sm hover:shadow-white transition-shadow duration-300 ease-in-out"
    >
      <div className="relative h-48 w-full">
        <Image
          src={room.images?.[0]}
          alt={room.name || "Room"}
          fill
          className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        />

        <RoomTypeBadge type={roomType?.name ?? ""} />
        {room.status !== "available" && (
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
            Up to {roomType?.capacity} guests
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {roomType?.amenities?.slice(0, 4).map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              {getFeatureIcon(feature)}
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-lg font-bold">
            ${roomType?.price}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / night
            </span>
          </div>
          {roomType?.weeklyRate && (
            <div className="text-sm text-muted-foreground">
              Weekly: ${roomType.weeklyRate}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            router.push(`/rooms/${room.id}`);
          }}
        >
          View Details
        </Button>

        <Button
          className="w-full ml-2"
          disabled={room.status !== "available"}
          onClick={() => router.push(`/reservation/new?roomId=${room.id}`)}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

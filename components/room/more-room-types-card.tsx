import Link from "next/link";
import { ImageCarousel } from "../image-carousel";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { RoomType } from "@/lib/types/room";
import { useRoomTypeImages } from "@/hooks/rooms/rooms";

type Props = {
  roomType: RoomType;
};

export const MoreRoomTypesCard = ({ roomType: rt }: Props) => {
  const { data: images } = useRoomTypeImages(rt.id);
  return (
    <Card
      key={rt.id}
      className="flex flex-col md:flex-row overflow-hidden hover:shadow-sm hover:shadow-white/20 transition-shadow duration-300 ease-in-out"
    >
      <div className="relative h-40 w-full md:w-1/3">
        <ImageCarousel
          images={images?.map((img) => img.url) || []}
          showControls={false}
          showIndicators={false}
          aspectRatio="square"
          className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>
      <div className="flex-1 p-4">
        <h3 className="font-semibold">{rt.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {rt.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-semibold">
            ${rt.price}
            <span className="text-sm font-normal text-muted-foreground">
              /night
            </span>
          </div>
          <Link href={`/room-types/${rt.id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

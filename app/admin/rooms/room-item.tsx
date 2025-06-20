import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { useRoomImages, useRoomTypeAmenities } from "@/hooks/rooms/rooms";
import { Room } from "@/lib/types/room";

type Props = {
  room: Room;
  handleEditClick: () => void;
};

export const RoomItem = ({ room, handleEditClick }: Props) => {
  const hotel = "";
  const { data: images } = useRoomImages(room.id);
  const { data: amenities } = useRoomTypeAmenities(room.type);
  return (
    <TableRow key={room.id}>
      <TableCell>{room.id}</TableCell>
      <TableCell>{room.name}</TableCell>
      <TableCell>{room.status}</TableCell>
      <TableCell>{hotel}</TableCell>
      <TableCell>
        {images?.length && images.length > 0 ? (
          <div className="flex gap-2">
            {images.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt="Room"
                className="w-12 h-10 object-cover rounded"
              />
            ))}
            {images.length > 2 && (
              <span className="text-xs text-gray-500">
                +{images.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">No images</span>
        )}
      </TableCell>
      <TableCell>
        {amenities?.length && amenities?.length > 0
          ? amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-block bg-white text-black text-xs px-2 py-1 rounded-full mr-1 mb-1"
              >
                {amenity.name}
              </span>
            ))
          : "—"}
      </TableCell>
      <TableCell>{room.description || "—"}</TableCell>
      <TableCell>
        <Button onClick={() => handleEditClick()}>Edit</Button>
      </TableCell>
    </TableRow>
  );
};

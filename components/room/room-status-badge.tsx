import { RoomStatus } from "@/lib/types/room";
import { Badge } from "../ui/badge";

type Props = {
  status: RoomStatus;
};

export const RoomStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-500">Available</Badge>;
    case "occupied":
      return <Badge className="bg-blue-500">Occupied</Badge>;
    //   case "reserved":
    //     return (
    //       <Badge variant="outline" className="border-amber-500 text-amber-500">
    //         Reserved
    //       </Badge>
    //     );
    case "maintenance":
      return <Badge variant="destructive">Maintenance</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

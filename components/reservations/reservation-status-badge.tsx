import { ReservationStatus } from "@/lib/types/reservation";
import { Badge } from "../ui/badge";

type Props = {
  status: ReservationStatus;
};

export const ReservationStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-blue-500">Pending Confirmation</Badge>;
    case "confirmed":
      return <Badge className="bg-yellow-500">Confirmed</Badge>;
    case "checked-in":
      return <Badge className="bg-green-500">Checked In</Badge>;
    case "checked-out":
      return <Badge variant="outline">Checked Out</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "no-show":
      return <Badge variant="destructive">No Show</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

import { PaymentStatus } from "@/lib/types/reservation";
import { Badge } from "../ui/badge";

type Props = {
  status: PaymentStatus;
};

export const ReservationPaymentStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-500">Paid</Badge>;
    case "unpaid":
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          Payment Pending
        </Badge>
      );
    case "partially_paid":
      return <Badge className="bg-blue-500">Partially Paid</Badge>;

    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

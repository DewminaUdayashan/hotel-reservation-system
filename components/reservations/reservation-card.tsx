import { ReservationWithAdditionalDetails } from "@/lib/types/reservation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar, CreditCard, Edit, Eye, Hotel, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { ReservationPaymentStatusBadge } from "./reservation-payment-status-badge";

type Props = {
  reservation: ReservationWithAdditionalDetails;
};

export const ReservationCard = ({ reservation }: Props) => {
  return (
    <Card key={reservation.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{reservation?.roomName}</CardTitle>
            <CardDescription>Reservation #{reservation.id}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ReservationStatusBadge status={reservation.status} />
            <ReservationPaymentStatusBadge status={reservation.paymentStatus} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(reservation.checkIn), "MMM dd, yyyy")} -{" "}
                {format(new Date(reservation.checkOut), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Hotel className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Room {reservation.id}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">
                ${reservation.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Payment Method:</span>
              <div className="flex items-center">
                <CreditCard className="mr-1 h-3 w-3 text-muted-foreground" />
                <span>
                  {reservation.paymentMethod === "credit-card"
                    ? "Credit Card"
                    : "Pay at Hotel"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 ml-auto">
          <Link href={`/reservations/${reservation.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          {(reservation.status === "pending" ||
            reservation.status === "confirmed") && (
            <>
              <Link href={`/reservations/${reservation.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Trash className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

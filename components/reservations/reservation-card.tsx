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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { useCancelReservation } from "@/hooks/reservations/reservations";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useUserById } from "@/hooks/users/users";
import { isWithin24Hours } from "@/lib/utils/moment";

type Props = {
  reservation: ReservationWithAdditionalDetails;
};

export const ReservationCard = ({ reservation }: Props) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [within24Hours, setWithin24Hours] = useState(false);
  const cancelReservationMutation = useCancelReservation();

  const { data: user } = useUserById(reservation?.customerId);

  useEffect(() => {
    if (reservation) {
      setWithin24Hours(isWithin24Hours(reservation.checkIn));
    }
  }, [reservation]);

  const handleCancel = () => {
    if (within24Hours) {
      toast({
        title: "Cancellation Failed",
        description:
          "You cannot cancel a reservation within 24 hours of check-in.",
        variant: "destructive",
      });
      return;
    }
    cancelReservationMutation.mutate(reservation.id, {
      onSuccess: () => {
        router.push("/reservations");
        toast({
          title: "Reservation Cancelled",
          description: `${user?.firstName ?? "The user"} ${user?.lastName}'s reservation has been cancelled.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Cancellation Failed",
          description:
            error.message ??
            "An error occurred while cancelling the reservation.",
          variant: "destructive",
        });
      },
      onSettled: () => {
        setShowCancelDialog(false);
      },
    });
  };

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
            {reservation.status !== "cancelled" && (
              <ReservationPaymentStatusBadge
                status={reservation.paymentStatus}
              />
            )}
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
                $
                {reservation.blockBookingId
                  ? reservation.blockTotalAmount?.toFixed(2)
                  : reservation.totalAmount.toFixed(2)}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelReservationMutation.isPending || within24Hours}
              >
                <Trash className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardFooter>
      {/* Cancel Reservation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Reservation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelReservationMutation.isPending}
            >
              {cancelReservationMutation.isPending
                ? "Cancelling..."
                : "Cancel Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

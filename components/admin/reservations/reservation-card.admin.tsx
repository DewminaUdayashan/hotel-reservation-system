import {
  ReservationStatusAction,
  ReservationWithAdditionalDetails,
} from "@/lib/types/reservation";

import {
  Calendar,
  CheckCircle,
  CreditCard,
  Edit,
  Eye,
  Hotel,
  LogIn,
  LogOut,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { useEffect, useState } from "react";
import { useCancelReservation } from "@/hooks/reservations/reservations";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useUserById } from "@/hooks/users/users";
import { isWithin24Hours } from "@/lib/utils/moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { ReservationPaymentStatusBadge } from "@/components/reservations/reservation-payment-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useUpdateReservationStatus } from "@/hooks/reservations/reservations.admin";

type Props = {
  reservation: ReservationWithAdditionalDetails;
};

export const ReservationCardAdmin = ({ reservation }: Props) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [within24Hours, setWithin24Hours] = useState(false);
  const [isCheckInTime, setIsCheckInTime] = useState(false);

  const cancelReservationMutation = useCancelReservation();
  const updateStatusMutation = useUpdateReservationStatus(reservation.id);

  const { data: user } = useUserById(reservation?.customerId);

  const canCheckIn = (checkIn: Date) => {
    return new Date() >= new Date(checkIn);
  };

  useEffect(() => {
    if (reservation) {
      setWithin24Hours(isWithin24Hours(reservation.checkIn));
      setIsCheckInTime(canCheckIn(new Date(reservation.checkIn)));
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
          description: `${user?.firstName ?? "The user"} ${
            user?.lastName
          }'s reservation has been cancelled.`,
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

  const handleCheckInOut = () => {
    if (!isCheckInTime) {
      toast({
        title: "Too Early to Check In",
        description:
          "Check-in is not yet available. Please wait until the scheduled time.",
        variant: "default",
      });
      return;
    }
    let action: ReservationStatusAction = "check-in";
    if (reservation.status === "confirmed") {
      action = "check-in";
    } else if (reservation.status === "checked-in") {
      action = "check-out";
      router.push(
        `/admin/reservations/${
          reservation.id
        }/invoice-builder?checkOut=${encodeURIComponent(
          new Date().toISOString()
        )}`
      );
      return;
    }

    updateStatusMutation.mutate(
      { action },
      {
        onSuccess: () => {
          toast({
            title: action === "check-in" ? "Checked In" : "Checked Out",
            description: `Reservation #${reservation.id} has been ${
              action === "check-in" ? "checked in" : "checked out"
            }.`,
          });
        },
        onError: (error) => {
          toast({
            title: `${action === "check-in" ? "Check-in" : "Check-out"} Failed`,
            description:
              error.message ??
              `An error occurred while ${
                action === "check-in" ? "checking in" : "checking out"
              } the reservation.`,
            variant: "destructive",
          });
        },
      }
    );
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
            {isCheckInTime && reservation.status === "confirmed" && (
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Ready for Check-in</span>
              </div>
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
                ${reservation.totalAmount?.toFixed(2)}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/admin/reservations/${reservation.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          {(reservation.status === "pending" ||
            reservation.status === "confirmed") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelReservationMutation.isPending || within24Hours}
            >
              <Trash className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}

          {/* Check-In / Check-Out Button */}
          {(reservation.status === "confirmed" ||
            reservation.status === "checked-in") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCheckInOut}
              disabled={
                (reservation.status === "confirmed" && !isCheckInTime) ||
                updateStatusMutation.isPending
              }
            >
              {reservation.status === "confirmed" ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {updateStatusMutation.isPending
                    ? "Checking in.."
                    : "Check In"}
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {updateStatusMutation.isPending
                    ? "Checking out.."
                    : "Check Out"}
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Cancel Dialog */}
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Edit,
  Hotel,
  Printer,
  Trash,
  User,
  Utensils,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelReservation,
  useReservationById,
} from "@/hooks/reservations/reservations";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { ReservationPaymentStatusBadge } from "@/components/reservations/reservation-payment-status-badge";
import { AdminOnly } from "@/components/admin-only";
import { isWithin24Hours } from "@/lib/utils/moment";
import { toast } from "@/hooks/use-toast";

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = Number.parseInt(params?.id as string, 10);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [within24Hours, setWithin24Hours] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Mock data fetching with TanStack Query
  const { data: reservation, isLoading } = useReservationById(reservationId);

  const cancelReservationMutation = useCancelReservation();

  useEffect(() => {
    if (reservation) {
      setWithin24Hours(isWithin24Hours(reservation.checkIn));
    }
  }, [reservation]);

  if (isLoading || !reservation) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Loading reservation details...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we fetch the information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const customerName = `${reservation.firstName} ${reservation.lastName}`;

  const handleCheckIn = () => {
    // This would be an API call in a real application
    toast({
      title: "Check-in successful",
      description: `${customerName} has been checked in to room ${reservation.roomId}.`,
    });
    setIsCheckingIn(false);
  };

  const handleCheckOut = () => {
    // This would be an API call in a real application
    toast({
      title: "Check-out successful",
      description: `${customerName} has been checked out.`,
    });
    setIsCheckingOut(false);
  };

  const handleCancel = () => {
    cancelReservationMutation.mutate(reservationId, {
      onSuccess: () => {
        router.push("/reservations");
        toast({
          title: "Reservation Cancelled",
          description: `${customerName}'s reservation has been cancelled.`,
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
        setShowCancel(false);
      },
    });
  };

  const totalAdditionalCharges = 100;

  const grandTotal = reservation.totalAmount + totalAdditionalCharges;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Reservation #{reservation.id}</h1>
          <p className="text-muted-foreground">
            Created on {format(reservation.createdAt, "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {reservation.status === "confirmed" && (
            <Dialog open={isCheckingIn} onOpenChange={setIsCheckingIn}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Check In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check In Guest</DialogTitle>
                  <DialogDescription>
                    Confirm check-in for {customerName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="room-number">Room Number</Label>
                    <Input id="room-number" defaultValue={reservation.roomId} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="key-issued">Key Card Number</Label>
                    <Input
                      id="key-issued"
                      placeholder="Enter key card number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="check-in-notes">Notes</Label>
                    <Textarea
                      id="check-in-notes"
                      placeholder="Any special notes for this check-in"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCheckingIn(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCheckIn}>Complete Check In</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {reservation.status === "checked-in" && (
            <Dialog open={isCheckingOut} onOpenChange={setIsCheckingOut}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check Out Guest</DialogTitle>
                  <DialogDescription>
                    Confirm check-out for {customerName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <select
                      id="payment-method"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="credit-card">Credit Card (on file)</option>
                      <option value="new-card">New Credit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="additional-charges">
                      Additional Charges
                    </Label>
                    <Input
                      id="additional-charges"
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="check-out-notes">Notes</Label>
                    <Textarea
                      id="check-out-notes"
                      placeholder="Any notes for this check-out"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCheckingOut(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCheckOut}>Complete Check Out</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Hotel className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">{reservation.roomType}</div>
                  <div className="text-sm text-muted-foreground">
                    Room {reservation.roomId}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">Status</div>
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="font-medium">Check-in Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(reservation.checkIn, "MMMM dd, yyyy")}</span>
                </div>
              </div>
              <div>
                <div className="font-medium">Check-out Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(reservation.checkOut, "MMMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="font-medium">Number of Guests</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {reservation.guests}{" "}
                    {reservation.guests === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-medium">Special Requests</div>
                <div className="text-sm text-muted-foreground">
                  {reservation.specialRequests || "None"}
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Tabs defaultValue="charges">
                <TabsList>
                  <TabsTrigger value="charges">Charges</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                <TabsContent value="charges" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>Room Charge ({reservation.roomType})</div>
                      <div>${reservation.totalAmount.toFixed(2)}</div>
                    </div>
                    {reservation.additionalCharges &&
                      reservation.additionalCharges.map((charge) => (
                        <div
                          key={charge.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {charge.description === "Room Service" ? (
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                            ) : charge.description === "Restaurant" ? (
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                            ) : charge.description === "Wifi" ? (
                              <Wifi className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{charge.description}</span>
                            <span className="text-xs text-muted-foreground">
                              ({format(charge.date, "MMM dd")})
                            </span>
                          </div>
                          <div>${charge.amount.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <div>Total</div>
                    <div>${grandTotal.toFixed(2)}</div>
                  </div>
                  <AdminOnly>
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Charge
                    </Button>
                  </AdminOnly>
                </TabsContent>
                <TabsContent value="payment" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Payment Status</div>
                      <ReservationPaymentStatusBadge
                        status={reservation.paymentStatus}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Payment Method</div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {reservation.paymentMethod === "credit-card"
                            ? "Credit Card"
                            : reservation.paymentMethod === "cash"
                            ? "Cash"
                            : "Other"}
                        </span>
                      </div>
                    </div>
                    {reservation.card && (
                      <div className="flex items-center justify-between">
                        <div>Card Details</div>
                        <div className="text-sm">
                          **** **** **** {reservation.card.cardNumber} (Expires:{" "}
                          {reservation.card.expiryMonth}/
                          {reservation.card.expiryYear})
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>Total Amount</div>
                      <div>${grandTotal.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Amount Paid</div>
                      <div>
                        $
                        {reservation.paymentStatus === "paid"
                          ? grandTotal.toFixed(2)
                          : reservation.paymentStatus === "partially_paid"
                          ? (grandTotal * 0.5).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <div>Balance Due</div>
                      <div>
                        $
                        {reservation.paymentStatus === "paid"
                          ? "0.00"
                          : reservation.paymentStatus === "partially_paid"
                          ? (grandTotal * 0.5).toFixed(2)
                          : grandTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <AdminOnly>
                    <Button size="sm" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Collect Payment
                    </Button>
                  </AdminOnly>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">{customerName}</div>
                <div className="text-sm text-muted-foreground">Guest</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">Contact Information</div>
              <div className="grid gap-1">
                <div className="text-sm">{reservation.email}</div>
                <div className="text-sm">{reservation.phone}</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">Reservation History</div>
              <div className="text-sm text-muted-foreground">
                3 previous stays at this property
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View History
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">Actions</div>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    router.push(`/reservations/${reservationId}/edit`)
                  }
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (within24Hours) {
                      toast({
                        title: "Cancellation Failed",
                        description:
                          "You cannot cancel a reservation within 24 hours of check-in.",
                        variant: "destructive",
                      });
                    } else {
                      setShowCancel(true);
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Cancel Reservation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action is
              irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCancel(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelReservationMutation.isPending}
            >
              {cancelReservationMutation.isPending
                ? "Confirm Cancellation"
                : "Cancelling..."}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

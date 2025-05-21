"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  Hotel,
  Search,
  Trash,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthDialog } from "@/components/auth-dialog";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/auth/useAuth";

export default function ReservationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(
    null
  );

  const user = useAuth().user;
  const reservations = [];
  const cancelReservation = () => {};

  // Check if user is logged in
  useEffect(() => {
    // Only show auth dialog on initial render if user is not logged in
    if (!user && !showAuthDialog) {
      setShowAuthDialog(true);
    }
  }, []); // Empty dependency array to run only once

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      res.id.toLowerCase().includes(searchLower) ||
      res.customerName?.toLowerCase().includes(searchLower) ||
      res.roomType?.toLowerCase().includes(searchLower)
    );
  });

  const handleCancelReservation = () => {
    if (selectedReservation) {
      // cancelReservation(selectedReservation);
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been successfully cancelled.",
      });
      setShowCancelDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked-in":
        return <Badge className="bg-green-500">Checked In</Badge>;
      case "checked-out":
        return <Badge variant="outline">Checked Out</Badge>;
      case "reserved":
        return <Badge className="bg-blue-500">Reserved</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no-show":
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        );
      case "partial":
        return <Badge className="bg-blue-500">Partial</Badge>;
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">My Reservations</h1>
      </div>

      <div className="grid gap-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reservations..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/reservation/new">
            <Button>
              <Hotel className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        {/* Reservations List */}
        {filteredReservations.length > 0 ? (
          <div className="grid gap-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {reservation.roomType}
                      </CardTitle>
                      <CardDescription>
                        Reservation #{reservation.id}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(reservation.status)}
                      {getPaymentStatusBadge(reservation.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(
                            new Date(reservation.checkIn),
                            "MMM dd, yyyy"
                          )}{" "}
                          -{" "}
                          {format(
                            new Date(reservation.checkOut),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Hotel className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Room {reservation.roomNumber}</span>
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
                    {reservation.status === "reserved" && (
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
                          onClick={() => {
                            setSelectedReservation(reservation.id);
                            setShowCancelDialog(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Hotel className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No reservations found
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {searchTerm
                  ? "No reservations match your search criteria. Try a different search term."
                  : "You don't have any reservations yet. Book a room to get started."}
              </p>
              <Link href="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

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
            <Button variant="destructive" onClick={handleCancelReservation}>
              Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={(open) => setShowAuthDialog(open)}
        onSuccess={() => setShowAuthDialog(false)}
      />

      <Toaster />
    </div>
  );
}

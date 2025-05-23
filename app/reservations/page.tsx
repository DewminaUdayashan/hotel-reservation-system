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
  Loader2, // Added for loading state
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
import { useReservations } from "@/hooks/reservation"; // Added useReservations
import { Reservation } from "@/lib/types/reservation"; // Added Reservation type

export default function ReservationsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth(); // Get user and isAdmin
  const {
    data: reservations,
    isLoading,
    error,
  } = useReservations(); // Fetch reservations

  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"current" | "past" | "all">("current"); // For admin filters

  // Check if user is logged in
  useEffect(() => {
    if (!user && !isLoading && !showAuthDialog) { // Ensure not to show if loading or already shown
      setShowAuthDialog(true);
    }
  }, [user, isLoading, showAuthDialog]);

  const handleCancelReservation = () => {
    if (selectedReservationId) {
      // TODO: Implement actual cancellation logic using a mutation from useReservations
      console.log("Cancelling reservation:", selectedReservationId);
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been successfully cancelled.",
      });
      setShowCancelDialog(false);
      setSelectedReservationId(null);
    }
  };

  const getStatusBadge = (status: Reservation["status"]) => { // Corrected type and status value
    switch (status) {
      case "checked-in":
        return <Badge className="bg-green-500">Checked In</Badge>;
      case "checked-out":
        return <Badge variant="outline">Checked Out</Badge>;
      case "reserved":
        return <Badge className="bg-blue-500">Reserved</Badge>;
      case "canceled": // Corrected to "canceled"
        return <Badge variant="destructive">Canceled</Badge>;
      // "no-show" is not in the type, but we can keep it if it's a possible status from backend
      case "no-show":
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: Reservation["paymentStatus"]) => {
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

  // Filter and search logic
  const processedReservations = (() => {
    if (!reservations) return [];

    let filtered = reservations;

    if (isAdmin) {
      if (filterStatus === "current") {
        filtered = reservations.filter(
          (r) => r.status === "reserved" || r.status === "checked-in"
        );
      } else if (filterStatus === "past") {
        filtered = reservations.filter(
          (r) => r.status === "checked-out" || r.status === "canceled"
        );
      }
      // 'all' uses the reservations as is
    }
    // For non-admins, all their reservations are "current" in a sense, no date-based filtering here yet.

    if (!searchTerm) return filtered;
    const searchLower = searchTerm.toLowerCase();
    return filtered.filter((res) => {
      const customerName = isAdmin && res.customerId ? `Customer ID: ${res.customerId}` : res.customerName; // Placeholder for customerName
      return (
        res.id.toLowerCase().includes(searchLower) ||
        (customerName && customerName.toLowerCase().includes(searchLower)) ||
        res.roomType?.toLowerCase().includes(searchLower) ||
        (isAdmin && res.customerId?.toLowerCase().includes(searchLower)) // Search by customerId for admins
      );
    });
  })();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading reservations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-red-500 text-lg">
          Error loading reservations: {error.message}
        </p>
        <Button onClick={() => router.refresh()} className="mt-4"> {/* Or a refetch function from useReservations */}
          Try Again
        </Button>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Manage Reservations" : "My Reservations"}
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Search, Filters (Admin), and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isAdmin ? "Search by ID, Customer, Room..." : "Search your reservations..."}
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "current" ? "default" : "outline"}
                onClick={() => setFilterStatus("current")}
              >
                Current
              </Button>
              <Button
                variant={filterStatus === "past" ? "default" : "outline"}
                onClick={() => setFilterStatus("past")}
              >
                Past
              </Button>
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
            </div>
          )}
          {!isAdmin && (
             <Link href="/reservation/new">
              <Button>
                <Hotel className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </Link>
          )}
        </div>

        {/* Reservations List */}
        {processedReservations.length > 0 ? (
          <div className="grid gap-4">
            {processedReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {reservation.roomType}
                      </CardTitle>
                      <CardDescription>
                        Reservation #{reservation.id}
                        {isAdmin && reservation.customerId && ( // Display Customer ID for Admins
                          <span className="block text-xs text-muted-foreground">
                            Customer ID: {reservation.customerId}
                          </span>
                        )}
                         {isAdmin && reservation.customerName && ( // Display Customer Name for Admins if available
                          <span className="block text-xs text-muted-foreground">
                            Customer: {reservation.customerName}
                          </span>
                        )}
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
                            new Date(reservation.checkIn), // Corrected field name
                            "MMM dd, yyyy"
                          )}{" "}
                          -{" "}
                          {format(
                            new Date(reservation.checkOut), // Corrected field name
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Hotel className="mr-2 h-4 w-4 text-muted-foreground" />
                        {/* roomNumber might not be directly on reservation, it could be part of room details */}
                        <span>Room ID: {reservation.roomId}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Amount:</span>
                        <span className="font-medium">
                          ${reservation.totalAmount?.toFixed(2) ?? 'N/A'} 
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Payment Method:</span>
                        <div className="flex items-center">
                          <CreditCard className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>
                            {reservation.paymentMethod === "credit-card"
                              ? "Credit Card"
                              : reservation.paymentMethod === "cash"
                                ? "Cash" // Assuming 'cash' is a valid payment method
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
                    {/* Edit/Cancel for admin might need different logic/permissions */}
                    {(reservation.status === "reserved" || (isAdmin && reservation.status !== 'checked-out' && reservation.status !== 'canceled')) && (
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
                            setSelectedReservationId(reservation.id);
                            setShowCancelDialog(true);
                          }}
                          disabled={reservation.status === 'checked-in' || reservation.status === 'checked-out' || reservation.status === 'canceled'}
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
                  : isAdmin
                    ? "There are no reservations matching the current filter."
                    : "You don't have any reservations yet. Book a room to get started."}
              </p>
              {!isAdmin && (
                <Link href="/rooms">
                  <Button>Browse Rooms</Button>
                </Link>
              )}
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
              onClick={() => {
                setShowCancelDialog(false);
                setSelectedReservationId(null);
              }}
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
        onSuccess={() => {
          setShowAuthDialog(false);
          // Potentially refetch data or refresh page if needed after login
        }}
      />

      <Toaster />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Hotel, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserReservations } from "@/hooks/reservations/reservations";
import { ReservationCard } from "@/components/reservations/reservation-card";

export default function ReservationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { user } = useAuth();
  const { data: reservations } = useUserReservations();

  // Check if user is logged in
  useEffect(() => {
    // Only show auth dialog on initial render if user is not logged in
    setShowAuthDialog(!user);
  }, [user]);

  // Filter reservations
  const filteredReservations = reservations?.filter((res) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      res.id?.toString().toLowerCase()?.includes(searchLower) ||
      res?.roomName?.toLowerCase()?.includes(searchLower) ||
      res?.specialRequests?.toLowerCase()?.includes(searchLower)
    );
  });

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
        {(filteredReservations?.length ?? 0) > 0 ? (
          <div className="grid gap-4">
            {filteredReservations?.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
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

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={(open) => setShowAuthDialog(open)}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </div>
  );
}

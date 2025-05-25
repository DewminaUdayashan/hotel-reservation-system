"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminReservations } from "@/hooks/reservations/reservations.admin";
import { ReservationCard } from "@/components/reservations/reservation-card";
import { ReservationWithAdditionalDetails } from "@/lib/types/reservation";
import { useAllHotels } from "@/hooks/hotels/hotels";

export default function AdminReservationListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [hotelId, setHotelId] = useState<number | undefined>(undefined);

  const { data: hotels } = useAllHotels();
  const { data, isLoading, isFetching } = useAdminReservations({
    page,
    search,
    status,
    hotelId,
    orderBy: "checkInDate",
    orderDir: "ASC",
  });

  const reservations: ReservationWithAdditionalDetails[] = data?.data || [];
  const total = data?.totalCount || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const handleStatusChange = (value: string) => {
    setStatus(value === "any" ? undefined : value);
    setPage(1);
  };

  const handleHotelChange = (value: string) => {
    setHotelId(value === "any" ? undefined : Number(value));
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search by name, email or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={status || "any"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked-in</SelectItem>
              <SelectItem value="checked-out">Checked-out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={hotelId?.toString() || "any"}
            onValueChange={handleHotelChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by hotel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Hotels</SelectItem>
              {hotels?.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

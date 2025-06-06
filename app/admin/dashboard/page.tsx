"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { ReservationPaymentStatusBadge } from "@/components/reservations/reservation-payment-status-badge";
import { RoomStatusBadge } from "@/components/room/room-status-badge";
import { useQuery } from "@tanstack/react-query";
import { useRoomFilterStore } from "@/lib/stores/useRoomFilterStore";
import { useUserReservations } from "@/hooks/reservations/reservations";
import { useAllRooms } from "@/hooks/rooms/rooms";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Settings } from "lucide-react";
import { useDashboardStats } from "@/hooks/reports/useDashboardStats";
import { useMemo, useState } from "react";
import { useAdminReservations } from "@/hooks/reservations/reservations.admin";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filters = useRoomFilterStore((state) => state.filters);

  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: stats } = useDashboardStats(todayDate);

  const occupancyRateToday = stats?.occupancyRateToday || 0;
  const occupancyRateFromYesterday =
    occupancyRateToday - (stats?.occupancyRateYesterday || 0);

  const revenueToday = stats?.revenueToday || 0;
  const revenueFromYesterday = revenueToday - (stats?.revenueYesterday || 0);

  const availableRooms = stats?.availableRooms || 0;
  const totalRooms = stats?.totalRooms || 0;

  const occupiedRooms = totalRooms - availableRooms;
  const todayCheckIns = stats?.todayCheckIns || 0;
  const todayCheckOuts = stats?.todayCheckOuts || 0;

  const { data: reservationData, isLoading: isReservationsLoading } =
    useAdminReservations({
      page,
      pageSize,
      orderBy: "checkInDate",
      orderDir: "DESC",
    });

  const { data: rooms } = useAllRooms({});

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRateToday}%</div>
              <p className="text-xs text-muted-foreground">
                {occupancyRateFromYesterday.toFixed(2)}% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueToday.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueFromYesterday}% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Available Rooms
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableRooms}</div>
              <p className="text-xs text-muted-foreground">
                {occupiedRooms} out of {totalRooms} total rooms
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Check-ins
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCheckIns}</div>
              <p className="text-xs text-muted-foreground">
                {todayCheckOuts} check-outs scheduled
              </p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="reservations">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="reservations" className="border-none p-0 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Recent Reservations</CardTitle>
                {/* <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button size="sm">New Reservation</Button>
                </div> */}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reservation ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservationData?.data?.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">
                          {reservation.id}
                        </TableCell>
                        <TableCell>{reservation.firstName}</TableCell>
                        <TableCell>{reservation.roomType}</TableCell>
                        <TableCell>
                          {format(reservation.checkIn, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(reservation.checkOut, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <ReservationStatusBadge status={reservation.status} />
                        </TableCell>
                        <TableCell>
                          <ReservationPaymentStatusBadge
                            status={reservation.paymentStatus}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ${reservation.totalAmount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing <strong>{reservationData?.data?.length || 0}</strong>{" "}
                  of <strong>{reservationData?.totalCount || 0}</strong>{" "}
                  reservations
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      reservationData?.totalCount
                        ? page * pageSize >= reservationData.totalCount
                        : true
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="rooms" className="border-none p-0 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Room Status</CardTitle>
                <div className="ml-auto flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <Button size="sm">Add Room</Button> */}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms?.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.id}</TableCell>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>
                          <RoomStatusBadge
                            status={room.isReserved ? "occupied" : room.status}
                          />
                        </TableCell>
                        <TableCell>{room.capacity || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Settings</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing <strong>8</strong> of <strong>48</strong> rooms
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

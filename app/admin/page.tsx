"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Hotel,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock data fetching with TanStack Query
  const { data: reservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => {
      // This would be an API call in a real application
      return [
        {
          id: "RES1001",
          customerName: "John Smith",
          roomType: "Deluxe Room",
          checkIn: new Date("2023-06-15"),
          checkOut: new Date("2023-06-18"),
          status: "checked-in",
          paymentStatus: "pending",
          totalAmount: 540,
        },
        {
          id: "RES1002",
          customerName: "Emily Johnson",
          roomType: "Standard Room",
          checkIn: new Date("2023-06-16"),
          checkOut: new Date("2023-06-20"),
          status: "reserved",
          paymentStatus: "paid",
          totalAmount: 480,
        },
        {
          id: "RES1003",
          customerName: "Michael Brown",
          roomType: "Executive Suite",
          checkIn: new Date("2023-06-14"),
          checkOut: new Date("2023-06-17"),
          status: "checked-out",
          paymentStatus: "paid",
          totalAmount: 750,
        },
        {
          id: "RES1004",
          customerName: "Sarah Wilson",
          roomType: "Residential Suite",
          checkIn: new Date("2023-06-10"),
          checkOut: new Date("2023-06-24"),
          status: "checked-in",
          paymentStatus: "partial",
          totalAmount: 4900,
        },
        {
          id: "RES1005",
          customerName: "David Lee",
          roomType: "Standard Room",
          checkIn: new Date("2023-06-17"),
          checkOut: new Date("2023-06-19"),
          status: "reserved",
          paymentStatus: "pending",
          totalAmount: 240,
        },
      ]
    },
    initialData: [],
  })

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => {
      // This would be an API call in a real application
      return [
        { id: 101, type: "Standard Room", status: "occupied", currentGuest: "John Smith" },
        { id: 102, type: "Standard Room", status: "available", currentGuest: null },
        { id: 103, type: "Deluxe Room", status: "occupied", currentGuest: "Emily Johnson" },
        { id: 104, type: "Deluxe Room", status: "available", currentGuest: null },
        { id: 105, type: "Executive Suite", status: "maintenance", currentGuest: null },
        { id: 106, type: "Executive Suite", status: "available", currentGuest: null },
        { id: 107, type: "Residential Suite", status: "occupied", currentGuest: "Sarah Wilson" },
        { id: 108, type: "Residential Suite", status: "available", currentGuest: null },
      ]
    },
    initialData: [],
  })

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => {
      // This would be an API call in a real application
      return {
        occupancyRate: 75,
        availableRooms: 12,
        reservedRooms: 8,
        occupiedRooms: 28,
        todayCheckIns: 5,
        todayCheckOuts: 3,
        revenue: {
          today: 1250,
          thisWeek: 8750,
          thisMonth: 32500,
        },
      }
    },
    initialData: {
      occupancyRate: 0,
      availableRooms: 0,
      reservedRooms: 0,
      occupiedRooms: 0,
      todayCheckIns: 0,
      todayCheckOuts: 0,
      revenue: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
    },
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "checked-in":
        return <Badge className="bg-green-500">Checked In</Badge>
      case "checked-out":
        return <Badge variant="outline">Checked Out</Badge>
      case "reserved":
        return <Badge className="bg-blue-500">Reserved</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "no-show":
        return <Badge variant="destructive">No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        )
      case "partial":
        return <Badge className="bg-blue-500">Partial</Badge>
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoomStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>
      case "occupied":
        return <Badge className="bg-blue-500">Occupied</Badge>
      case "reserved":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Reserved
          </Badge>
        )
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Hotel className="h-6 w-6" />
                <span className="">LuxeStay Admin</span>
              </Link>
            </div>
            <nav className="grid gap-2 px-2">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Reservations
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                Rooms
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-4 w-4" />
                Customers
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Hotel className="h-6 w-6" />
          <span className="hidden md:inline">LuxeStay Admin</span>
        </Link>
        <div className="relative flex-1 md:grow-0 md:basis-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-full bg-background pl-8 md:w-[300px]" />
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Calendar className="h-4 w-4" />
              Reservations
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Building2 className="h-4 w-4" />
              Rooms
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Users className="h-4 w-4" />
              Customers
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
          <div className="mt-auto p-4">
            <Link href="/auth/logout">
              <Button variant="outline" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </Link>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <div className="flex items-center gap-2">
                <Select defaultValue="today">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Generate Report</Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
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
                  <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
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
                  <div className="text-2xl font-bold">${stats.revenue.today.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+5.1% from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
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
                  <div className="text-2xl font-bold">{stats.availableRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.availableRooms} out of {stats.availableRooms + stats.occupiedRooms + stats.reservedRooms}{" "}
                    total rooms
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
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
                  <div className="text-2xl font-bold">{stats.todayCheckIns}</div>
                  <p className="text-xs text-muted-foreground">{stats.todayCheckOuts} check-outs scheduled</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="reservations">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="reservations" className="border-none p-0 pt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center">
                    <CardTitle>Recent Reservations</CardTitle>
                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button size="sm">New Reservation</Button>
                    </div>
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
                        {reservations.map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell className="font-medium">{reservation.id}</TableCell>
                            <TableCell>{reservation.customerName}</TableCell>
                            <TableCell>{reservation.roomType}</TableCell>
                            <TableCell>{format(reservation.checkIn, "MMM dd, yyyy")}</TableCell>
                            <TableCell>{format(reservation.checkOut, "MMM dd, yyyy")}</TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(reservation.paymentStatus)}</TableCell>
                            <TableCell className="text-right">${reservation.totalAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>5</strong> of <strong>25</strong> reservations
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
                      <Button size="sm">Add Room</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room Number</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Current Guest</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.id}</TableCell>
                            <TableCell>{room.type}</TableCell>
                            <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                            <TableCell>{room.currentGuest || "—"}</TableCell>
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
              <TabsContent value="reports" className="border-none p-0 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                      Generate and view reports for hotel operations and financial performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Occupancy Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">View current and historical occupancy rates.</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            Generate
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Revenue Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Analyze revenue by room type, date range, and more.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            Generate
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">No-Show Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Track no-show reservations and associated revenue.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            Generate
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    <div>
                      <h3 className="mb-4 text-lg font-medium">Scheduled Reports</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Last Generated</TableHead>
                            <TableHead>Recipients</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Daily Occupancy</TableCell>
                            <TableCell>Daily (7 PM)</TableCell>
                            <TableCell>Today, 7:00 PM</TableCell>
                            <TableCell>Manager, Front Desk</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Weekly Revenue</TableCell>
                            <TableCell>Weekly (Monday)</TableCell>
                            <TableCell>May 27, 2023</TableCell>
                            <TableCell>Manager, Finance</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Monthly Performance</TableCell>
                            <TableCell>Monthly (1st)</TableCell>
                            <TableCell>June 1, 2023</TableCell>
                            <TableCell>Management Team</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

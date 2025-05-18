"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, CreditCard, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useStore } from "@/lib/store"

// Form validation schema
const formSchema = z.object({
  specialRequests: z.string().optional(),
  guests: z.string().min(1, "Number of guests is required"),
})

export default function EditReservationPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = params.id as string

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const { reservations, updateReservation } = useStore((state) => ({
    reservations: state.reservations,
    updateReservation: state.updateReservation,
  }))

  // Find the reservation
  const reservation = reservations.find((res) => res.id === reservationId)

  // Initialize form with values from the reservation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialRequests: reservation?.specialRequests || "",
      guests: reservation?.guests.toString() || "1",
    },
  })

  // Initialize date range
  useEffect(() => {
    if (reservation) {
      setDateRange({
        from: new Date(reservation.checkIn),
        to: new Date(reservation.checkOut),
      })
    }
  }, [reservation])

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!reservation) return

    // Calculate total amount based on new dates if changed
    let totalAmount = reservation.totalAmount
    if (
      dateRange.from &&
      dateRange.to &&
      (dateRange.from.getTime() !== new Date(reservation.checkIn).getTime() ||
        dateRange.to.getTime() !== new Date(reservation.checkOut).getTime())
    ) {
      const nights = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      // This is simplified - in a real app we'd recalculate based on room price
      totalAmount =
        (reservation.totalAmount /
          Math.ceil(
            (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          )) *
        nights
    }

    // Update reservation
    updateReservation(reservationId, {
      checkIn: dateRange.from || new Date(reservation.checkIn),
      checkOut: dateRange.to || new Date(reservation.checkOut),
      guests: Number.parseInt(values.guests),
      specialRequests: values.specialRequests || "",
      totalAmount,
    })

    toast({
      title: "Reservation updated",
      description: "Your reservation has been successfully updated.",
    })

    router.push(`/reservations/${reservationId}`)
  }

  if (!reservation) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Reservation not found</h2>
            <p className="text-muted-foreground mb-4">The reservation you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/reservations")}>View All Reservations</Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate nights and total price
  const nights =
    dateRange.from && dateRange.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0

  // This is simplified - in a real app we'd get the actual room price
  const roomPrice =
    reservation.totalAmount /
    Math.ceil(
      (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24),
    )

  const totalPrice = nights * roomPrice

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Reservation</h1>
          <p className="text-muted-foreground">Reservation #{reservationId}</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
              <CardDescription>Update your reservation details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div>
                        <FormLabel>Room Type</FormLabel>
                        <div className="flex items-center h-10 px-3 rounded-md border">
                          <Hotel className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {reservation.roomType} (Room {reservation.roomNumber})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Room type cannot be changed. Please make a new reservation if you want a different room.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Guests</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select number of guests" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 Guest</SelectItem>
                                <SelectItem value="2">2 Guests</SelectItem>
                                <SelectItem value="3">3 Guests</SelectItem>
                                <SelectItem value="4">4 Guests</SelectItem>
                                <SelectItem value="5">5+ Guests</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel>Stay Dates</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.from && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                                  </>
                                ) : (
                                  format(dateRange.from, "MMM dd, yyyy")
                                )
                              ) : (
                                <span>Select dates</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange.from}
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={2}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requests</FormLabel>
                            <FormControl>
                              <Input placeholder="Any special requests or requirements" {...field} />
                            </FormControl>
                            <FormDescription>
                              Let us know if you have any special requirements for your stay.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Reservation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Hotel className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{reservation.roomType}</span>
              </div>
              {dateRange.from && dateRange.to && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{format(dateRange.from, "EEE, MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{format(dateRange.to, "EEE, MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length of stay:</span>
                    <span>
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </div>
                </div>
              )}
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Room rate:</span>
                  <span>${roomPrice.toFixed(2)} / night</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment method: {reservation.paymentMethod === "credit-card" ? "Credit Card" : "Pay at Hotel"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

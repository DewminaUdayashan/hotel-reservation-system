"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { addHours, format, isBefore } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Hotel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useReservationById,
  useUpdateReservation,
} from "@/hooks/reservations/reservations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoomAvailability } from "@/hooks/rooms/rooms";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  specialRequests: z.string().optional(),
  guests: z.string().min(1, "Number of guests is required"),
});

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = Number.parseInt(params?.id as string, 10);

  const { user } = useAuth();

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [tmpDateRange, setTmpDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [isCheckInWithin24Hours, setIsCheckInWithin24Hours] = useState(false);

  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  const { data: reservation } = useReservationById(reservationId);

  const { data: isAvailable, isLoading: checkingAvailability } =
    useRoomAvailability(
      reservation?.roomId,
      tmpDateRange?.from?.toISOString(),
      tmpDateRange?.to?.toISOString(),
      user?.id
    );

  const updateReservationMutation = useUpdateReservation(reservationId);

  // Initialize form with values from the reservation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialRequests: reservation?.specialRequests || "",
      guests: reservation?.guests.toString() || "1",
    },
  });

  // Initialize date range
  useEffect(() => {
    if (reservation) {
      setDateRange({
        from: new Date(reservation.checkIn),
        to: new Date(reservation.checkOut),
      });
      setTmpDateRange({
        from: new Date(reservation.checkIn),
        to: new Date(reservation.checkOut),
      });
    }
  }, [reservation]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!reservation) return;

    // Calculate total amount based on new dates if changed
    let totalAmount = reservation.totalAmount;
    if (
      dateRange.from &&
      dateRange.to &&
      (dateRange.from.getTime() !== new Date(reservation.checkIn).getTime() ||
        dateRange.to.getTime() !== new Date(reservation.checkOut).getTime())
    ) {
      const nights = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      // This is simplified - in a real app we'd recalculate based on room price
      totalAmount =
        (reservation.totalAmount /
          Math.ceil(
            (new Date(reservation.checkOut).getTime() -
              new Date(reservation.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )) *
        nights;
    }

    // // Update reservation
    updateReservationMutation.mutate(
      {
        reservationId,
        checkInDate: dateRange.from?.toISOString(),
        checkOutDate: dateRange.to?.toISOString(),
        numberOfGuests: Number.parseInt(values.guests),
        specialRequests: values.specialRequests || "",
        totalAmount,
      },
      {
        onSuccess: () => {
          toast({
            title: "Reservation updated",
            description: "Your reservation has been successfully updated.",
            variant: "default",
          });
          router.push(`/reservations/${reservationId}`);
        },
        onError: () => {
          toast({
            title: "Error updating reservation",
            description: "There was an error updating your reservation.",
            variant: "destructive",
          });
        },
      }
    );

    router.push(`/reservations/${reservationId}`);
  };

  useEffect(() => {
    if (reservation) {
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);

      setDateRange({
        from: checkInDate,
        to: checkOutDate,
      });

      setTmpDateRange({
        from: checkInDate,
        to: checkOutDate,
      });

      // Check if check-in date is within 24 hours
      const now = new Date();
      const twentyFourHoursFromNow = addHours(now, 24);
      setIsCheckInWithin24Hours(isBefore(checkInDate, twentyFourHoursFromNow));
    }
  }, [reservation]);

  const handleConfirmDates = () => {
    if (tmpDateRange.from && tmpDateRange.to) {
      setDateRange(tmpDateRange);
      setDateDialogOpen(false);
    }
  };

  if (!reservation) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Reservation not found
            </h2>
            <p className="text-muted-foreground mb-4">
              The reservation you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/reservations")}>
              View All Reservations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate nights and total price
  const nights =
    dateRange.from && dateRange.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // This is simplified - in a real app we'd get the actual room price
  const roomPrice =
    reservation.totalAmount /
    Math.ceil(
      (new Date(reservation.checkOut).getTime() -
        new Date(reservation.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );

  const totalPrice = nights * roomPrice;

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
              <CardDescription>
                Update your reservation details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div>
                        <FormLabel>Room Type</FormLabel>
                        <div className="flex items-center h-10 px-3 rounded-md border">
                          <Hotel className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {reservation.roomType} (Room {reservation.roomId})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Room type cannot be changed. Please make a new
                          reservation if you want a different room.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Guests</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
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
                                !dateRange.from && "text-muted-foreground"
                              )}
                              onClick={() => setDateDialogOpen(true)}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                                    {format(dateRange.to, "MMM dd, yyyy")}
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
                              onSelect={(range) =>
                                setDateRange({
                                  from: range?.from,
                                  to: range?.to,
                                })
                              }
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
                              <Input
                                placeholder="Any special requests or requirements"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Let us know if you have any special requirements
                              for your stay.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateReservationMutation.isPending}
                    >
                      {updateReservationMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
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
                Payment method:{" "}
                {reservation.paymentMethod === "credit-card"
                  ? "Credit Card"
                  : "Pay at Hotel"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Date Selection Dialog */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Select Stay Dates</DialogTitle>
            <DialogDescription>
              Choose your check-in and check-out dates for your stay.
            </DialogDescription>
          </DialogHeader>

          {isCheckInWithin24Hours && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your check-in date is within 24 hours and cannot be modified.
                You can only change your check-out date.
              </AlertDescription>
            </Alert>
          )}

          {checkingAvailability ? (
            <div className="text-center py-4">Checking availability...</div>
          ) : isAvailable === false ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The room is not available for the selected dates. Please choose
                different dates.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="mb-4 text-green-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <AlertDescription className="text-green-600">
                The room is available for you on the selected dates.
              </AlertDescription>
            </Alert>
          )}

          <div className="py-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tmpDateRange.from}
              selected={tmpDateRange}
              onSelect={(range) => {
                if (isCheckInWithin24Hours) {
                  // Only allow changing check-out date
                  setTmpDateRange({
                    from: dateRange.from,
                    to: range?.to,
                  });
                } else {
                  setTmpDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }
              }}
              numberOfMonths={2}
              disabled={(date) => {
                // Disable dates in the past
                if (date < new Date()) return true;

                // If check-in is within 24 hours, disable all dates before current check-in
                if (isCheckInWithin24Hours && dateRange.from) {
                  return date < dateRange.from;
                }

                return false;
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDates}
              disabled={!tmpDateRange.from || !tmpDateRange.to}
            >
              Confirm Dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, CreditCard, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AuthDialog } from "@/components/auth-dialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRoomById } from "@/hooks/rooms/rooms";
import { useRoomFilterStore } from "@/lib/stores/useRoomFilterStore";

// Form validation schema
const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    roomType: z.string().min(1, "Room type is required"),
    guests: z.string().min(1, "Number of guests is required"),
    specialRequests: z.string().optional(),
    withCreditCard: z.boolean().default(true),
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
  })
  .refine(
    (data) => {
      // If withCreditCard is true, validate card details
      if (data.withCreditCard) {
        return (
          !!data.cardName &&
          !!data.cardNumber &&
          !!data.cardExpiry &&
          !!data.cardCvc
        );
      }
      return true;
    },
    {
      message: "Credit card details are required",
      path: ["cardName"],
    }
  );

export default function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = Number.parseInt(searchParams?.get("roomId") || "");

  const { data: room } = useRoomById(roomId);

  const [step, setStep] = useState(1);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const filters = useRoomFilterStore((state) => state.filters);
  const user = useAuth().user;

  // Check if user is logged in
  useEffect(() => {
    // Only show auth dialog on initial render if user is not logged in
    if (!user && !showAuthDialog) {
      setShowAuthDialog(true);
    }
  }, []); // Empty dependency array to run only once

  // Get room type from room ID
  const selectedRoomType = room?.type;

  // Initialize form with values from global state
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email || "",
      phone: user?.phone || "",
      roomType: selectedRoomType?.toString() || "",
      guests: filters.capacity?.toString() || "1",
      specialRequests: "",
      withCreditCard: true,
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const createReservation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get room details
      const roomType = roomTypes.find((rt) => rt.id === values.roomType);
      if (!roomType) throw new Error("Room type not found");

      // Find an available room of the selected type
      const availableRoom = rooms.find(
        (r) => r.type === values.roomType && r.status === "available"
      );
      if (!availableRoom) throw new Error("No available rooms of this type");

      // Calculate total amount
      const nights =
        filters.checkIn && filters.checkOut
          ? Math.ceil(
              (filters.checkOut.getTime() - filters.checkIn.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 1;

      const totalAmount = roomType.price * nights;

      // Create reservation in store
      const reservationId = addReservation({
        customerId: user.id,
        roomId: availableRoom.id,
        checkIn: filters.checkIn || new Date(),
        checkOut: filters.checkOut || new Date(Date.now() + 86400000),
        guests: Number.parseInt(values.guests),
        status: "reserved",
        paymentStatus: values.withCreditCard ? "pending" : "pending",
        paymentMethod: values.withCreditCard ? "credit-card" : "pay-at-hotel",
        totalAmount,
        additionalCharges: [],
        specialRequests: values.specialRequests || "",
        customerName: `${values.firstName} ${values.lastName}`,
        roomType: roomType.name,
        roomNumber: availableRoom.id.toString(),
      });

      return { success: true, reservationId };
    },
    onSuccess: (data) => {
      toast({
        title: "Reservation created!",
        description: `Your reservation ID is ${data.reservationId}`,
      });
      router.push(`/reservations/${data.reservationId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "There was an error creating your reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createReservation.mutate(values);
  };

  const availableRoomTypes = roomTypes.map((type) => ({
    id: type.id,
    name: type.name,
    price: type.price,
  }));

  const selectedRoom = availableRoomTypes.find(
    (room) => room.id === form.watch("roomType")
  );
  const nights =
    filters.checkIn && filters.checkOut
      ? Math.ceil(
          (filters.checkOut.getTime() - filters.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = selectedRoom && nights ? selectedRoom.price * nights : 0;

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
        <h1 className="text-3xl font-bold">New Reservation</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
              <CardDescription>
                Please fill in the details to make your reservation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="john.doe@example.com"
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1 (555) 000-0000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="roomType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a room type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRoomTypes.map((room) => (
                                    <SelectItem key={room.id} value={room.id}>
                                      {room.name} - ${room.price}/night
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="stayDates"
                          render={() => (
                            <FormItem>
                              <FormLabel>Stay Dates</FormLabel>
                              <FormControl>
                                {filters.checkIn && filters.checkOut ? (
                                  <div className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center">
                                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <span>
                                        {format(
                                          filters.checkIn,
                                          "MMM dd, yyyy"
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          filters.checkOut,
                                          "MMM dd, yyyy"
                                        )}
                                      </span>
                                    </div>
                                    <Link href="/rooms">
                                      <Button variant="ghost" size="sm">
                                        Change
                                      </Button>
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    Please select your stay dates on the{" "}
                                    <Link
                                      href="/rooms"
                                      className="text-primary hover:underline"
                                    >
                                      rooms page
                                    </Link>{" "}
                                    before making a reservation.
                                  </div>
                                )}
                              </FormControl>
                            </FormItem>
                          )}
                        />
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
                      <FormField
                        control={form.control}
                        name="withCreditCard"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Provide credit card details now
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      {!form.watch("withCreditCard") && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                          Note: Reservations without credit card details will be
                          automatically cancelled at 7 PM on the day of arrival.
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && form.watch("withCreditCard") && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name on Card</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="4111 1111 1111 1111"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cardCvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    {step < (form.watch("withCreditCard") ? 2 : 1) ? (
                      <Button type="button" onClick={() => setStep(step + 1)}>
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          createReservation.isPending ||
                          !filters.checkIn ||
                          !filters.checkOut
                        }
                      >
                        {createReservation.isPending
                          ? "Creating..."
                          : "Complete Reservation"}
                      </Button>
                    )}
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
                <span className="font-medium">
                  {selectedRoom ? selectedRoom.name : "Select a room"}
                </span>
              </div>
              {filters.checkIn && filters.checkOut && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{format(filters.checkIn, "EEE, MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{format(filters.checkOut, "EEE, MMM d, yyyy")}</span>
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
                  <span>${selectedRoom ? selectedRoom.price : 0} / night</span>
                </div>
                {nights > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & fees (12%):</span>
                      <span>${(totalPrice * 0.12).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-medium pt-2">
                  <span>Total:</span>
                  <span>
                    ${nights > 0 ? (totalPrice * 1.12).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
              {form.watch("withCreditCard") ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment will be collected at checkout
                </div>
              ) : (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  Without credit card details, your reservation will be
                  automatically cancelled at 7 PM on the day of arrival.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={(open) => setShowAuthDialog(open)}
        onSuccess={() => setShowAuthDialog(false)}
      />

      <Toaster />
    </div>
  );
}

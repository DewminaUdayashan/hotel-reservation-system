"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, set } from "date-fns";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  useRoomAvailability,
  useRoomById,
  useRoomTypeById,
} from "@/hooks/rooms/rooms";
import { useRoomFilterStore } from "@/lib/stores/useRoomFilterStore";
import { useReserveRoom } from "@/hooks/reservations/reservations";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth-dialog";

const formSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    guests: z.string().min(1),
    specialRequests: z.string().optional(),
    withCreditCard: z.boolean(),
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    checkInDate: z.date(),
    checkOutDate: z.date(),
  })
  .refine(
    (data) => {
      if (data.withCreditCard) {
        return (
          data.cardName && data.cardNumber && data.cardExpiry && data.cardCvc
        );
      }
      return true;
    },
    {
      message: "Credit card details are required",
      path: ["cardName"],
    }
  )
  .refine((data) => data.checkInDate < data.checkOutDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

export default function NewReservationForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const searchParams = useSearchParams();
  const roomId = Number(searchParams?.get("roomId"));

  const { data: room } = useRoomById(roomId);
  const { data: roomType } = useRoomTypeById(room?.type);

  const filters = useRoomFilterStore((state) => state.filters);
  const reserveMutation = useReserveRoom();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      guests: filters.capacity?.toString() || "1",
      specialRequests: "",
      withCreditCard: false,
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      checkInDate: filters.checkIn,
      checkOutDate: filters.checkOut,
    },
  });

  const checkIn = form.watch("checkInDate");
  const checkOut = form.watch("checkOutDate");

  const { data: isAvailable, isLoading: checkingAvailability } =
    useRoomAvailability(
      roomId,
      checkIn?.toISOString(),
      checkOut?.toISOString()
    );

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : undefined;

  const totalPrice =
    !nights || !roomType ? undefined : roomType?.price * nights;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!isAvailable) return;

    reserveMutation.mutate(
      {
        customerId: user!.id,
        roomId,
        checkInDate: values.checkInDate.toISOString(),
        checkOutDate: values.checkOutDate.toISOString(),
        numberOfGuests: Number(values.guests),
      },
      {
        onSuccess: (reservationId) => {
          toast({
            title: "Reservation successful",
            description: `ID: ${reservationId}`,
          });
          router.push(`/reservations/${reservationId}`);
        },
        onError: (err: any) => {
          toast({
            title: "Reservation failed",
            description: err?.response?.data?.error || err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    setShowAuthDialog(!user);
  }, [user]);

  if (!room || !roomType || !roomId) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Skeleton className="h-96" />
        <Skeleton className="h-96 w-full mt-3" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Reservation</CardTitle>
          <CardDescription>You're booking: {room.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="phone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stay Dates */}
              <FormField
                name="checkInDate"
                control={form.control}
                render={() => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Stay Dates</FormLabel>
                    <DateRangePicker
                      dateRange={{
                        from: form.watch("checkInDate"),
                        to: form.watch("checkOutDate"),
                      }}
                      onSelect={(range) => {
                        if (range.from) {
                          form.setValue("checkInDate", range.from);
                        }
                        if (range.to) {
                          form.setValue("checkOutDate", range.to);
                        }
                      }}
                    />
                    {!checkingAvailability && isAvailable === false && (
                      <p className="text-sm text-red-500 mt-1">
                        This room is not available for the selected dates.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    value={`${roomType.name} - $${roomType.price}/night`}
                  />
                </FormControl>
              </FormItem>

              <FormField
                name="guests"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((g) => (
                          <SelectItem key={g} value={g.toString()}>
                            {g} Guest{g > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="specialRequests"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {checkIn && checkOut && (
                <div className="text-sm text-muted-foreground">
                  Stay: {format(checkIn, "PPP")} - {format(checkOut, "PPP")} (
                  {nights} nights)
                </div>
              )}

              {totalPrice && (
                <div className="font-medium">
                  Total Price: ${totalPrice.toFixed(2)}
                </div>
              )}

              <Button
                type="submit"
                disabled={reserveMutation.isPending || isAvailable === false}
              >
                {reserveMutation.isPending
                  ? "Submitting..."
                  : "Confirm Reservation"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={(open) => setShowAuthDialog(open)}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </div>
  );
}

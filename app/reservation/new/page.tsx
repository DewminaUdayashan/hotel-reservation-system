"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
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
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  Hotel,
} from "lucide-react";

const formSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    guests: z.string().min(1),
    specialRequests: z.string().optional(),
    checkInDate: z.date(),
    checkOutDate: z.date(),
  })
  .refine((data) => data.checkInDate < data.checkOutDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  })
  .refine((data) => {
    // Add validation for residential rooms
    const nights = Math.ceil(
      (data.checkOutDate.getTime() - data.checkInDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // This will be checked against room data in the component
    return true; // We'll handle this validation in the component where we have room data
  });

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be 3 digits").max(4),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  country: z.string().min(1, "Country is required"),
});

type ReservationStep = "details" | "payment" | "processing" | "confirmation";

// Helper function to determine card type based on card number
const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, "");

  if (number.startsWith("4")) return "Visa";
  if (
    number.startsWith("5") ||
    (number.startsWith("2") &&
      Number.parseInt(number.substring(0, 4)) >= 2221 &&
      Number.parseInt(number.substring(0, 4)) <= 2720)
  )
    return "Mastercard";
  if (number.startsWith("3")) return "American Express";
  if (number.startsWith("6")) return "Discover";

  return "Unknown";
};

// Helper function to determine bank name (simplified mock implementation)
const getBankName = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, "");

  // This is a simplified mock - in reality, you'd use BIN (Bank Identification Number) lookup
  const firstFour = number.substring(0, 4);

  if (firstFour.startsWith("4111")) return "Chase Bank";
  if (firstFour.startsWith("4000")) return "Bank of America";
  if (firstFour.startsWith("5555")) return "Wells Fargo";
  if (firstFour.startsWith("5105")) return "Citibank";
  if (firstFour.startsWith("3782")) return "American Express";

  return "Unknown Bank";
};

// Helper function to calculate stay duration in different units
const calculateStayDuration = (checkIn: Date, checkOut: Date) => {
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeks = Math.floor(nights / 7);
  const months = Math.floor(nights / 30);

  return { nights, weeks, months };
};

// Helper function to get appropriate rate and period for residential rooms
const getResidentialRate = (room: any, nights: number) => {
  if (!room?.isResidential) return null;

  // For stays 30+ days, use monthly rate
  if (nights >= 30 && room.monthlyRate) {
    const months = Math.floor(nights / 30);
    const remainingDays = nights % 30;
    const monthlyTotal = months * room.monthlyRate;
    const dailyTotal = remainingDays * (room.monthlyRate / 30); // Pro-rated daily rate

    return {
      type: "monthly",
      rate: room.monthlyRate,
      period: "month",
      total: monthlyTotal + dailyTotal,
      breakdown: `${months} month${months !== 1 ? "s" : ""}${remainingDays > 0 ? ` + ${remainingDays} days` : ""}`,
    };
  }

  // For stays 7+ days, use weekly rate
  if (nights >= 7 && room.weeklyRate) {
    const weeks = Math.floor(nights / 7);
    const remainingDays = nights % 7;
    const weeklyTotal = weeks * room.weeklyRate;
    const dailyTotal = remainingDays * (room.weeklyRate / 7); // Pro-rated daily rate

    return {
      type: "weekly",
      rate: room.weeklyRate,
      period: "week",
      total: weeklyTotal + dailyTotal,
      breakdown: `${weeks} week${weeks !== 1 ? "s" : ""}${remainingDays > 0 ? ` + ${remainingDays} days` : ""}`,
    };
  }

  return null;
};

export default function NewReservationForm() {
  const router = useRouter();
  const { user, customer } = useAuth();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<ReservationStep>("details");
  const [reservationData, setReservationData] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasPaymentDetails, setHasPaymentDetails] = useState(false);

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
      phone: customer?.phone ?? "",
      guests: filters.capacity?.toString() || "1",
      specialRequests: "",
      checkInDate: filters.checkIn,
      checkOutDate: filters.checkOut,
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
      city: "",
      zipCode: "",
      country: "United States",
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
      : 0;

  // Calculate pricing based on room type
  const getPricing = () => {
    if (!nights || !roomType)
      return { total: 0, breakdown: null, isResidential: false };

    if (room?.isResidential) {
      const residentialRate = getResidentialRate(room, nights);
      if (residentialRate) {
        return {
          total: residentialRate.total,
          breakdown: residentialRate,
          isResidential: true,
        };
      }
      // If residential but doesn't meet minimum stay requirements
      return {
        total: 0,
        breakdown: null,
        isResidential: true,
        invalidStay: true,
      };
    }

    // Regular room pricing
    return {
      total: roomType.price * nights,
      breakdown: null,
      isResidential: false,
    };
  };

  const pricing = getPricing();
  const totalPrice = pricing.total;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const onSubmitDetails = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!isAvailable) return;

    // Validate residential room minimum stay
    if (room?.isResidential && pricing.invalidStay) {
      toast({
        title: "Invalid stay duration",
        description:
          "Residential rooms require a minimum stay of 7 days for weekly rates or 30 days for monthly rates.",
        variant: "destructive",
      });
      return;
    }

    setReservationData(values);
    setCurrentStep("payment");
  };

  const onSubmitPayment = async (
    values: z.infer<typeof paymentSchema> | null
  ) => {
    setCurrentStep("processing");
    setPaymentProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create reservation
      reserveMutation.mutate(
        {
          customerId: user!.id,
          roomId,
          checkInDate: reservationData.checkInDate.toISOString(),
          checkOutDate: reservationData.checkOutDate.toISOString(),
          numberOfGuests: Number(reservationData.guests),
          specialRequests: reservationData.specialRequests || "",
          email: user!.email,
          name: user!.firstName,
          // Include payment details if provided
          ...(values && {
            cardHolderName: values.cardholderName,
            maskedCardNumber: `****-****-****-${values.cardNumber.replace(/\s/g, "").slice(-4)}`,
            cardType: getCardType(values.cardNumber),
            expiryMonth: Number.parseInt(values.expiryDate.split("/")[0]),
            expiryYear: Number.parseInt(`20${values.expiryDate.split("/")[1]}`),
            bankName: getBankName(values.cardNumber),
          }),
        },
        {
          onSuccess: (reservationId) => {
            setCurrentStep("confirmation");
            toast({
              title: "Reservation confirmed!",
              description: `Your reservation ID is ${reservationId}`,
            });
          },
          onError: (err: any) => {
            setCurrentStep("payment");
            toast({
              title: "Reservation failed",
              description: err?.response?.data?.error || err.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error: any) {
      setCurrentStep("payment");
      toast({
        title: values ? "Payment authorization failed" : "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
      setHasPaymentDetails(!!values);
    }
  };

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: customer?.phone ?? "",
      });

      paymentForm.setValue(
        "cardholderName",
        `${user.firstName} ${user.lastName}`
      );
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

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center ${currentStep === "details" ? "text-blue-600" : currentStep === "payment" || currentStep === "processing" || currentStep === "confirmation" ? "text-green-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "details" ? "bg-blue-600 text-white" : currentStep === "payment" || currentStep === "processing" || currentStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            {currentStep === "payment" ||
            currentStep === "processing" ||
            currentStep === "confirmation" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "1"
            )}
          </div>
          <span className="ml-2 text-sm font-medium">Details</span>
        </div>

        <div
          className={`w-8 h-0.5 ${currentStep === "payment" || currentStep === "processing" || currentStep === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}
        />

        <div
          className={`flex items-center ${currentStep === "payment" ? "text-blue-600" : currentStep === "processing" || currentStep === "confirmation" ? "text-green-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "payment" ? "bg-blue-600 text-white" : currentStep === "processing" || currentStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            {currentStep === "processing" || currentStep === "confirmation" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "2"
            )}
          </div>
          <span className="ml-2 text-sm font-medium">Payment</span>
        </div>

        <div
          className={`w-8 h-0.5 ${currentStep === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}
        />

        <div
          className={`flex items-center ${currentStep === "confirmation" ? "text-green-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            {currentStep === "confirmation" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "3"
            )}
          </div>
          <span className="ml-2 text-sm font-medium">Confirmation</span>
        </div>
      </div>
    </div>
  );

  // Details Step
  if (currentStep === "details") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <StepIndicator />

        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>You're booking: {room.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitDetails)}
                className="space-y-6"
              >
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
                            const maxCheckout = new Date(
                              range.from!.toISOString()
                            );
                            maxCheckout.setMonth(maxCheckout.getMonth() + 1);

                            if (range.to > maxCheckout) {
                              toast({
                                title: "Invalid checkout date",
                                description:
                                  "Check-out cannot be more than 1 month after check-in.",
                                variant: "destructive",
                              });
                              return;
                            }

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
                      value={
                        room.isResidential
                          ? `${roomType.name} - ${room.weeklyRate}/week or ${room.monthlyRate}/month`
                          : `${roomType.name} - $${roomType.price}/night`
                      }
                    />
                  </FormControl>
                </FormItem>

                {room?.isResidential && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Hotel className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Residential Room
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">
                      This is a residential room designed for extended stays.
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {room.weeklyRate && (
                        <div>
                          • Weekly rate: ${room.weeklyRate}/week (minimum 7
                          days)
                        </div>
                      )}
                      {room.monthlyRate && (
                        <div>
                          • Monthly rate: ${room.monthlyRate}/month (minimum 30
                          days)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {room?.isResidential && pricing.invalidStay && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">
                        Invalid Stay Duration
                      </span>
                    </div>
                    <p className="text-xs text-red-700">
                      Residential rooms require a minimum stay of 7 days. Please
                      select a longer stay period.
                    </p>
                  </div>
                )}

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
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Stay: {format(checkIn, "PPP")} - {format(checkOut, "PPP")}{" "}
                      ({nights} nights)
                    </div>
                    {pricing.breakdown && (
                      <div className="text-blue-600">
                        Billing: {pricing.breakdown.breakdown} at $
                        {pricing.breakdown.rate}/{pricing.breakdown.period}
                      </div>
                    )}
                  </div>
                )}

                {totalPrice > 0 && (
                  <div className="font-medium">
                    Total Price: ${totalPrice.toFixed(2)}
                    {pricing.breakdown && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({pricing.breakdown.type} rate)
                      </span>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isAvailable === false}
                  className="w-full"
                >
                  Continue to Payment
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

  // Payment Step
  if (currentStep === "payment") {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <StepIndicator />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Authorization
                </CardTitle>
                <CardDescription>
                  We'll authorize your card now and charge it at check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(onSubmitPayment)}
                    className="space-y-6"
                  >
                    <FormField
                      name="cardNumber"
                      control={paymentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              onChange={(e) => {
                                const formatted = formatCardNumber(
                                  e.target.value
                                );
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        name="expiryDate"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="MM/YY"
                                maxLength={5}
                                onChange={(e) => {
                                  const formatted = formatExpiryDate(
                                    e.target.value
                                  );
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="cvv"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="123"
                                maxLength={4}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="cardholderName"
                      control={paymentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John Doe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Billing Address</h3>

                      <FormField
                        name="billingAddress"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123 Main Street" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          name="city"
                          control={paymentForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="New York" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="zipCode"
                          control={paymentForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="10001" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        name="country"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="United States">
                                  United States
                                </SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="United Kingdom">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="Australia">
                                  Australia
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">
                          Payment Authorization Only
                        </p>
                        <p className="text-blue-700">
                          We'll hold this amount on your card and charge it at
                          check-in
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("details")}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Lock className="w-4 h-4 mr-2" />
                        Authorize Payment
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="mt-6 pt-6 border-t">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-900 mb-1">
                          Reserve Without Payment Details
                        </h4>
                        <p className="text-sm text-amber-800 mb-2">
                          You can complete your reservation without providing
                          payment details now.
                        </p>
                        <p className="text-xs text-amber-700">
                          <strong>Important:</strong> If you don't add payment
                          details within 24 hours, your reservation will be
                          automatically cancelled.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSubmitPayment(null)}
                    className="w-full"
                  >
                    Skip Payment Details - Reserve Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{room.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {roomType.name}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(reservationData.checkInDate, "MMM dd")} -{" "}
                      {format(reservationData.checkOutDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {reservationData.guests} Guest
                      {reservationData.guests > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {nights} Night{nights > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {pricing.breakdown
                        ? `${pricing.breakdown.type.charAt(0).toUpperCase() + pricing.breakdown.type.slice(1)} Rate`
                        : `Room Rate (${nights} nights)`}
                    </span>
                    <span>
                      {pricing.breakdown
                        ? `$${pricing.breakdown.total.toFixed(2)}`
                        : `$${roomType.price * nights}`}
                    </span>
                  </div>
                  {pricing.breakdown && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pricing.breakdown.breakdown}</span>
                      <span>
                        ${pricing.breakdown.rate}/{pricing.breakdown.period}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>${(totalPrice * 0.12).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Authorization Hold</span>
                    <span>${(totalPrice * 1.12).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">
                      Payment Options
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Provide payment details now or reserve without payment (must
                    add within 24 hours)
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Free Cancellation
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Cancel up to 24 hours before check-in
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Processing Step
  if (currentStep === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <StepIndicator />

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-2xl font-semibold">
                {hasPaymentDetails
                  ? "Authorizing Payment"
                  : "Confirming Reservation"}
              </h2>
              <p className="text-muted-foreground">
                {hasPaymentDetails
                  ? "Please wait while we authorize your payment method and confirm your reservation..."
                  : "Please wait while we confirm your reservation..."}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure authorization in progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation Step
  if (currentStep === "confirmation") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <StepIndicator />

        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-green-900">
                  Reservation Confirmed!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Your booking has been successfully processed
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest:</span>
                    <span className="font-medium text-black">
                      {reservationData.firstName} {reservationData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium text-black">{room.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium text-black">
                      {format(reservationData.checkInDate, "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium text-black">
                      {format(reservationData.checkOutDate, "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Authorization Hold:
                    </span>
                    <span className="font-medium text-black">
                      ${(totalPrice * 1.12).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {hasPaymentDetails ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Payment Authorized
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Your card ending in{" "}
                    {paymentForm.watch("cardNumber").slice(-4)} has been
                    authorized for ${(totalPrice * 1.12).toFixed(2)}. The actual
                    charge will be processed when you check in at the hotel.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-medium text-amber-900">
                      Payment Details Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">
                    You have <strong>24 hours</strong> to add payment details to
                    secure your reservation.
                  </p>
                  <Button size="sm" className="w-full">
                    Add Payment Details Now
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {reservationData.email}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/reservations")}
                    className="flex-1"
                  >
                    View My Reservations
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

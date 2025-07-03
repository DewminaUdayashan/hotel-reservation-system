"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Hotel,
  AlertCircle,
  Percent,
  CreditCard,
  ArrowLeft,
  Lock,
  Shield,
  CheckCircle,
  MapPin,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/auth/useAuth";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import {
  useBlockBookingPricing,
  useCreateBlockBooking,
} from "@/hooks/block-bookings/block-bookings";
import { useAllRooms } from "@/hooks/rooms/rooms";
import { useAllHotels } from "@/hooks/hotels/hotels";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

type BookingStep = "details" | "payment" | "processing" | "confirmation";

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

export default function BlockBookingPage() {
  const router = useRouter();
  const { user, agency, loading } = useAuth();
  const { calculateDiscount, minimumRooms, discountPercentage } =
    useBlockBookingPricing();
  const createBlockBookingMutation = useCreateBlockBooking();

  const [currentStep, setCurrentStep] = useState<BookingStep>("details");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(
    undefined
  );
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingData, setBookingData] = useState<any>(null);

  const checkIn = dateRange?.from;
  const checkOut = dateRange?.to;

  // Fetch hotels
  const { data: hotels, isLoading: loadingHotels } = useAllHotels();

  // Fetch rooms based on selected hotel and dates
  const { data: availableRooms, isLoading: loadingRooms } = useAllRooms({
    checkIn: checkIn?.toISOString(),
    checkOut: checkOut?.toISOString(),
    hotelId: selectedHotelId,
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: user ? `${user.firstName} ${user.lastName}` : "",
      billingAddress: "",
      city: "",
      zipCode: "",
      country: "United States",
    },
  });

  // Calculate pricing
  const totalOriginalAmount = selectedRooms.reduce((total, roomId) => {
    const room = availableRooms?.find((r) => r.id === roomId);
    if (!room || !checkIn || !checkOut) return total;

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return total + room.price * nights;
  }, 0);

  const pricingInfo = calculateDiscount(
    selectedRooms.length,
    totalOriginalAmount
  );

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

  const handleRoomSelection = (roomId: number, checked: boolean) => {
    if (checked) {
      setSelectedRooms((prev) => [...prev, roomId]);
    } else {
      setSelectedRooms((prev) => prev.filter((id) => id !== roomId));
    }
  };

  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(Number(hotelId));
    setSelectedRooms([]); // Clear selected rooms when hotel changes
  };

  const handleDetailsSubmit = () => {
    if (
      !agency ||
      !checkIn ||
      !checkOut ||
      !selectedHotelId ||
      selectedRooms.length < minimumRooms
    ) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields, select a hotel, and select at least ${minimumRooms} rooms.`,
        variant: "destructive",
      });
      return;
    }

    setBookingData({
      agencyId: agency.id,
      hotelId: selectedHotelId,
      roomIds: selectedRooms,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      numberOfGuests,
      specialRequests,
      customerId: user?.id,
    });
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (values: z.infer<typeof paymentSchema>) => {
    setCurrentStep("processing");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const blockBookingId = await createBlockBookingMutation.mutateAsync({
        ...bookingData,
        cardHolderName: values.cardholderName,
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        cardExpiryMonth: values.expiryDate.split("/")[0],
        cardExpiryYear: values.expiryDate.split("/")[1],
        cardCVC: values.cvv,
      });

      setCurrentStep("confirmation");
      toast({
        title: "Block Booking Created",
        description: `Your block booking #${blockBookingId} has been created successfully.`,
      });
    } catch (error: any) {
      setCurrentStep("payment");
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create block booking.",
        variant: "destructive",
      });
    }
  };

  // Redirect if not an agency
  if (!agency) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Block booking is only available for registered travel agencies.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const selectedHotel = hotels?.find((h) => h.id === selectedHotelId);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center ${
            currentStep === "details"
              ? "text-blue-600"
              : currentStep === "payment" ||
                  currentStep === "processing" ||
                  currentStep === "confirmation"
                ? "text-green-600"
                : "text-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "details"
                ? "bg-blue-600 text-white"
                : currentStep === "payment" ||
                    currentStep === "processing" ||
                    currentStep === "confirmation"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
            }`}
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
          className={`w-8 h-0.5 ${
            currentStep === "payment" ||
            currentStep === "processing" ||
            currentStep === "confirmation"
              ? "bg-green-600"
              : "bg-gray-200"
          }`}
        />

        <div
          className={`flex items-center ${
            currentStep === "payment"
              ? "text-blue-600"
              : currentStep === "processing" || currentStep === "confirmation"
                ? "text-green-600"
                : "text-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "payment"
                ? "bg-blue-600 text-white"
                : currentStep === "processing" || currentStep === "confirmation"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
            }`}
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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "confirmation"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
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
      <div className="max-w-6xl mx-auto py-8 px-4">
        <StepIndicator />

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Block Booking</h1>
          <p className="text-muted-foreground mt-2">
            Book multiple rooms for your clients with exclusive agency discounts
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Stay Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DateRangePicker
                  dateRange={dateRange}
                  onSelect={setDateRange}
                />
                {checkIn && checkOut && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {nights} night{nights !== 1 ? "s" : ""} •{" "}
                    {format(checkIn, "MMM dd")} -{" "}
                    {format(checkOut, "MMM dd, yyyy")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Hotel Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Select Hotel
                </CardTitle>
                <CardDescription>
                  Choose the hotel where you want to make your block booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHotels ? (
                  <div className="text-center py-8">Loading hotels...</div>
                ) : !hotels || hotels.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No hotels available at the moment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RadioGroup
                    value={selectedHotelId?.toString()}
                    onValueChange={handleHotelSelection}
                  >
                    <div className="space-y-4">
                      {hotels.map((hotel) => (
                        <div
                          key={hotel.id}
                          className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-600"
                        >
                          <RadioGroupItem
                            value={hotel.id.toString()}
                            id={`hotel-${hotel.id}`}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`hotel-${hotel.id}`}
                              className="cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-lg">
                                    {hotel.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{hotel.location}, </span>
                                  </div>

                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {hotel.description}
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="guests">Average Guests per Room</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="4"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any special requirements for your group..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Available Rooms
                </CardTitle>
                <CardDescription>
                  Select {minimumRooms} or more rooms to qualify for block
                  booking discount
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!checkIn || !checkOut ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select check-in and check-out dates to view
                      available rooms.
                    </AlertDescription>
                  </Alert>
                ) : !selectedHotelId ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a hotel to view available rooms.
                    </AlertDescription>
                  </Alert>
                ) : loadingRooms ? (
                  <div className="text-center py-8">
                    Loading available rooms...
                  </div>
                ) : !availableRooms || availableRooms.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No rooms available for the selected dates at this hotel.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={(checked) =>
                            handleRoomSelection(room.id, !!checked)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label
                                htmlFor={`room-${room.id}`}
                                className="font-medium"
                              >
                                {room.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {room.roomTypeName} • Room {room.id} •{" "}
                                {room.capacity} guests
                              </p>
                              {room.bedType && (
                                <p className="text-xs text-muted-foreground">
                                  {room.bedType} • {room.viewType}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${room.price}/night</p>
                              <p className="text-sm text-muted-foreground">
                                ${room.price * nights} total
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cancellation Policy:</strong> Block bookings can be
                cancelled up to 7 days before check-in. Cancellations within 7
                days will incur full charges.
              </AlertDescription>
            </Alert>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Agency:</span>
                    <span className="font-medium">{agency.agencyName}</span>
                  </div>
                  {selectedHotel && (
                    <div className="flex justify-between text-sm">
                      <span>Hotel:</span>
                      <span className="font-medium">{selectedHotel.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Rooms Selected:</span>
                    <span className="font-medium">{selectedRooms.length}</span>
                  </div>
                  {checkIn && checkOut && (
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{nights} nights</span>
                    </div>
                  )}
                </div>

                <Separator />

                {selectedRooms.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totalOriginalAmount.toFixed(2)}</span>
                    </div>

                    {pricingInfo.isEligible ? (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            Block Discount ({discountPercentage}%):
                          </span>
                          <span>-${pricingInfo.discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${pricingInfo.finalAmount.toFixed(2)}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="w-full justify-center"
                        >
                          You save ${pricingInfo.savings.toFixed(2)}!
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${totalOriginalAmount.toFixed(2)}</span>
                        </div>
                        {selectedRooms.length > 0 &&
                          selectedRooms.length < minimumRooms && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Select {minimumRooms - selectedRooms.length}{" "}
                                more room
                                {minimumRooms - selectedRooms.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                to get {discountPercentage}% discount
                              </AlertDescription>
                            </Alert>
                          )}
                      </>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment required to proceed</span>
                  </div>

                  <Button
                    onClick={handleDetailsSubmit}
                    disabled={
                      !checkIn ||
                      !checkOut ||
                      !selectedHotelId ||
                      selectedRooms.length < minimumRooms
                    }
                    className="w-full"
                  >
                    Continue to Payment
                  </Button>

                  {selectedRooms.length > 0 &&
                    selectedRooms.length < minimumRooms && (
                      <p className="text-xs text-red-500 text-center">
                        Minimum {minimumRooms} rooms required for block booking
                      </p>
                    )}

                  {!selectedHotelId && checkIn && checkOut && (
                    <p className="text-xs text-red-500 text-center">
                      Please select a hotel to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  if (currentStep === "payment") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <StepIndicator />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Payment is required to secure your block booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
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
                          Secure Payment Processing
                        </p>
                        <p className="text-blue-700">
                          Your payment information is encrypted and secure
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
                      <Button
                        type="submit"
                        disabled={createBlockBookingMutation.isPending}
                        className="flex-1"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {createBlockBookingMutation.isPending
                          ? "Processing..."
                          : "Complete Booking"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Block Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Agency:</span>
                    <span className="font-medium">{agency.agencyName}</span>
                  </div>
                  {selectedHotel && (
                    <div className="flex justify-between text-sm">
                      <span>Hotel:</span>
                      <span className="font-medium">{selectedHotel.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Rooms:</span>
                    <span className="font-medium">{selectedRooms.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-medium">{nights} nights</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span className="font-medium">
                      {checkIn && format(checkIn, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span className="font-medium">
                      {checkOut && format(checkOut, "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totalOriginalAmount.toFixed(2)}</span>
                  </div>
                  {pricingInfo.isEligible && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Block Discount ({discountPercentage}%):
                      </span>
                      <span>-${pricingInfo.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees:</span>
                    <span>${(pricingInfo.finalAmount * 0.12).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>${(pricingInfo.finalAmount * 1.12).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Block Booking Benefits
                    </span>
                  </div>
                  <ul className="text-xs text-green-700 mt-1 space-y-1">
                    <li>• {discountPercentage}% discount applied</li>
                    <li>• Priority customer support</li>
                    <li>• Flexible group management</li>
                  </ul>
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
              <h2 className="text-2xl font-semibold">Processing Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we process your payment and create your block
                booking...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure payment processing in progress</span>
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
                  Block Booking Confirmed!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Your block booking has been successfully created
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agency:</span>
                    <span className="font-medium text-black">
                      {agency.agencyName}
                    </span>
                  </div>
                  {selectedHotel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel:</span>
                      <span className="font-medium text-black">
                        {selectedHotel.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rooms:</span>
                    <span className="font-medium text-black">
                      {selectedRooms.length} rooms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium text-black">
                      {checkIn && format(checkIn, "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium text-black">
                      {checkOut && format(checkOut, "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="font-medium text-black">
                      ${(pricingInfo.finalAmount * 1.12).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Payment Processed
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Your payment has been successfully processed. Individual
                  reservations have been created for each room.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {user?.email}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/agency/block-bookings")}
                    className="flex-1"
                  >
                    View Block Bookings
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

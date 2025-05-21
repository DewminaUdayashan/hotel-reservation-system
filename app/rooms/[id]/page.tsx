"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCarousel } from "@/components/image-carousel";
import { AuthDialog } from "@/components/auth-dialog";
import {
  useAllRooms,
  useRoomAvailability,
  useRoomById,
  useRoomTypeAmenities,
  useRoomTypeById,
  useRoomTypeImages,
} from "@/hooks/rooms/rooms";
import { getFeatureIcon } from "@/components/room/feature-icon";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreRoomCard } from "@/components/room/more-room-card";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRoomFilterStore } from "@/lib/stores/useRoomFilterStore";

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Number.parseInt(params?.id as string);

  const { data: room, isLoading } = useRoomById(roomId);
  const { data: roomType, isLoading: isRoomTypeLoading } = useRoomTypeById(
    room?.type
  );
  const { data: images, isLoading: isImagesLoading } = useRoomTypeImages(
    room?.type
  );

  const { data: amenities, isLoading: isAmenitiesLoading } =
    useRoomTypeAmenities(room?.type);

  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const filters = useRoomFilterStore((state) => state.filters);
  const setFilters = useRoomFilterStore((state) => state.setFilters);

  const checkIn = filters.checkIn;
  const checkOut = filters.checkOut;
  const capacity = filters.capacity;
  const minPrice = filters.minPrice;
  const maxPrice = filters.maxPrice;
  const type = filters.roomType?.id;

  const user = useAuth().user;

  const { data: isAvailable, isLoading: isCheckingAvailability } =
    useRoomAvailability(
      roomId,
      checkIn?.toISOString() ?? undefined,
      checkOut?.toISOString() ?? undefined
    );

  const { data: similarRooms } = useAllRooms({
    capacity,
    checkIn: checkIn?.toISOString() ?? undefined,
    checkOut: checkOut?.toISOString() ?? undefined,
    maxPrice,
    minPrice,
    type,
  });

  const handleBookNow = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      router.push(`/reservation/new?roomId=${roomId}`);
    }
  };

  const handleAuthSuccess = () => {
    router.push(`/reservation/new?roomId=${roomId}`);
  };

  // Calculate nights and total price if dates are selected
  const nights =
    filters.checkIn && filters.checkOut
      ? Math.ceil(
          (filters.checkOut.getTime() - filters.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = roomType && nights ? roomType?.price * nights : 0;

  if (isLoading || isRoomTypeLoading || !room || !roomType) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Loading room details...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we fetch the information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <div className="flex items-center mt-1">
            <Users className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">
              Up to {room.capacity} guests
            </span>
            {room.isResidential && (
              <Badge className="ml-2 bg-primary">Residential</Badge>
            )}
            {!isCheckingAvailability &&
              (room.status !== "available" || !isAvailable) && (
                <Badge variant="destructive" className="ml-2">
                  Fully Booked
                </Badge>
              )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          {images && (
            <ImageCarousel
              images={images?.map((image) => image.url) || []}
              aspectRatio="video"
              className="rounded-lg overflow-hidden"
            />
          )}
          {(isImagesLoading || !images) && (
            <Skeleton className="h-96 w-full bg-white/20" />
          )}

          {/* Room Details */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Room Description
                </h2>
                <p className="text-muted-foreground">{room.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Room Size</h3>
                    <p className="text-muted-foreground">
                      {room.isResidential ? "45-60" : "30-40"} m²
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Bed Type</h3>
                    <p className="text-muted-foreground">{room.bedType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">View</h3>
                    <p className="text-muted-foreground">{room.viewType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Max Occupancy</h3>
                    <p className="text-muted-foreground">
                      {room.capacity}{" "}
                      {room.capacity === 1 ? "Person" : "People"}
                    </p>
                  </div>
                </div>
              </div>

              {room.isResidential && roomType && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Long-Term Stay Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Nightly</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${room.price}</div>
                        <p className="text-sm text-muted-foreground">
                          Flexible stay
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Weekly</CardTitle>
                        <CardDescription className="text-xs text-green-600">
                          Save 15%
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${room.weeklyRate}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${Math.round(roomType.weeklyRate ?? 0 / 7)}/night
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Monthly</CardTitle>
                        <CardDescription className="text-xs text-green-600">
                          Save 30%
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${room.monthlyRate}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${Math.round(room.monthlyRate ?? 0 / 30)}/night
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Room Amenities</h3>
                  <ul className="space-y-2">
                    {amenities &&
                      amenities?.map((amenity) => (
                        <li key={amenity.id} className="flex items-center">
                          {getFeatureIcon(amenity.name)}
                          <span className="ml-2">{amenity.name}</span>
                        </li>
                      ))}
                    {isAmenitiesLoading && (
                      <Skeleton className="h-4 w-full bg-white/20" />
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hotel Services</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2">24/7 Room Service</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2">Daily Housekeeping</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2">Concierge Service</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2">Laundry Service</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2">
                        Airport Transfer (on request)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Check-in & Check-out
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Check-in time starts at 3:00 PM
                  </p>
                  <p className="text-muted-foreground">
                    Check-out time is 12:00 PM
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Cancellation Policy
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Free cancellation up to 24 hours before check-in.
                  </p>
                  <p className="text-muted-foreground">
                    Cancellations made less than 24 hours before check-in are
                    subject to a charge equal to the first night's stay.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Additional Policies
                  </h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• No smoking in rooms (smoking areas available)</li>
                    <li>• Pets are not allowed</li>
                    <li>• Extra beds available for an additional charge</li>
                    <li>• Children of all ages are welcome</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Similar Rooms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Similar Rooms</h2>
              <Link href="/rooms">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all rooms
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarRooms &&
                similarRooms
                  .filter((rt) => rt.id !== room.type)
                  .slice(0, 2)
                  .map((room) => <MoreRoomCard key={room.id} room={room} />)}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book This Room</CardTitle>
              <CardDescription>
                {!isCheckingAvailability &&
                room.status === "available" &&
                isAvailable
                  ? "Secure your reservation now"
                  : "This room is currently unavailable for the selected dates"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                ${room.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / night
                </span>
              </div>

              {/* Date Selection */}
              {filters.checkIn && filters.checkOut ? (
                <div className="space-y-2 bg-muted p-3 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span className="font-medium">
                      {format(filters.checkIn, "EEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span className="font-medium">
                      {format(filters.checkOut, "EEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Length of stay:</span>
                    <span className="font-medium">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </div>
                  <Link
                    href="/rooms"
                    className="text-xs text-primary hover:underline block text-right"
                  >
                    Change dates
                  </Link>
                </div>
              ) : (
                <div className="bg-muted p-3 rounded-md text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm mb-2">No dates selected</p>
                  <DateRangePicker
                    dateRange={{
                      from: filters.checkIn,
                      to: filters.checkOut,
                    }}
                    onSelect={(range) => {
                      setFilters({
                        ...filters,
                        checkIn: range.from,
                        checkOut: range.to,
                      });
                    }}
                    popOverTrigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-primary hover:text-primary-foreground"
                      >
                        Select dates
                      </Button>
                    }
                  />
                </div>
              )}

              <Separator />

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${room.price} x {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>${roomType.price * nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & fees</span>
                    <span>${Math.round(roomType.price * nights * 0.12)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${Math.round(roomType.price * nights * 1.12)}</span>
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={
                  room.status !== "available" || !isAvailable || nights === 0
                }
                onClick={handleBookNow}
              >
                {nights === 0 ? "Select dates to book" : "Book Now"}
              </Button>

              {/* Payment Info */}
              <div className="flex items-center text-xs text-muted-foreground justify-center">
                <CreditCard className="h-3 w-3 mr-1" />
                No payment required today
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

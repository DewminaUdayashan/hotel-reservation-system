"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Coffee,
  CreditCard,
  Tv,
  Users,
  Wifi,
  Bath,
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
import { useStore } from "@/lib/store";
import { roomTypes, rooms } from "@/lib/data";
import { AuthDialog } from "@/components/auth-dialog";

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Number.parseInt(params.id as string);

  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const filters = useStore((state) => state.filters);
  const user = useStore((state) => state.user);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        // await new Promise((resolve) => setTimeout(resolve, 10));

        // Find room in our mock data
        const roomData = rooms.find((r) => r.id === roomId);
        if (!roomData) {
          throw new Error("Room not found");
        }

        // Get room type details
        const roomTypeDetails = roomTypes.find((rt) => rt.id === roomData.type);
        if (!roomTypeDetails) {
          throw new Error("Room type not found");
        }

        // Combine data
        setRoom({
          ...roomData,
          ...roomTypeDetails,
          isAvailable: roomData.status === "available",
          // Generate multiple images for the gallery
          images: [
            roomTypeDetails.images[0],
            "/placeholder.svg?height=600&width=800&text=Room+View",
            "/placeholder.svg?height=600&width=800&text=Bathroom",
            "/placeholder.svg?height=600&width=800&text=Amenities",
          ],
        });
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const handleBookNow = () => {
    if (!user.isLoggedIn) {
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

  const totalPrice = room && nights ? room.price * nights : 0;

  if (isLoading || !room) {
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
            {!room.isAvailable && (
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
          <ImageCarousel
            images={room.images}
            aspectRatio="video"
            className="rounded-lg overflow-hidden"
          />

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
                    <p className="text-muted-foreground">
                      {room.type === "standard"
                        ? "Queen Bed"
                        : room.type === "deluxe"
                        ? "King Bed"
                        : room.type === "executive"
                        ? "King Bed + Sofa Bed"
                        : "King Bed + Twin Beds"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">View</h3>
                    <p className="text-muted-foreground">
                      {room.type === "standard"
                        ? "City View"
                        : room.type === "deluxe"
                        ? "Garden View"
                        : "Panoramic View"}
                    </p>
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

              {room.isResidential && (
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
                          ${Math.round(room.weeklyRate / 7)}/night
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
                          ${Math.round(room.monthlyRate / 30)}/night
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
                    {room.amenities?.map((amenity) => (
                      <li key={amenity} className="flex items-center">
                        {getFeatureIcon(amenity)}
                        <span className="ml-2">{amenity}</span>
                      </li>
                    ))}
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
              {roomTypes
                .filter((rt) => rt.id !== room.type)
                .slice(0, 2)
                .map((roomType) => (
                  <Card
                    key={roomType.id}
                    className="flex flex-col md:flex-row overflow-hidden"
                  >
                    <div className="relative h-40 w-full md:w-1/3">
                      <ImageCarousel
                        images={roomType.images}
                        showControls={false}
                        showIndicators={false}
                        aspectRatio="square"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold">{roomType.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {roomType.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-lg font-semibold">
                          ${roomType.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /night
                          </span>
                        </div>
                        <Link
                          href={`/rooms/${
                            rooms.find((r) => r.type === roomType.id)?.id || 1
                          }`}
                        >
                          <Button size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book This Room</CardTitle>
              <CardDescription>
                {room.isAvailable
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
                  <Link href="/rooms">
                    <Button variant="outline" size="sm" className="w-full">
                      Select dates
                    </Button>
                  </Link>
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
                    <span>${room.price * nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & fees</span>
                    <span>${Math.round(room.price * nights * 0.12)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${Math.round(room.price * nights * 1.12)}</span>
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!room.isAvailable || nights === 0}
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

// Helper function to get feature icon
function getFeatureIcon(feature: string) {
  if (feature.includes("WiFi"))
    return <Wifi className="h-4 w-4 text-muted-foreground" />;
  if (feature.includes("Coffee"))
    return <Coffee className="h-4 w-4 text-muted-foreground" />;
  if (feature.includes("TV"))
    return <Tv className="h-4 w-4 text-muted-foreground" />;
  if (feature.includes("Bathroom") || feature.includes("Jacuzzi"))
    return <Bath className="h-4 w-4 text-muted-foreground" />;
  return <Check className="h-4 w-4 text-green-500" />;
}

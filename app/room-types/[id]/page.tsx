"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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
import { useStore } from "@/lib/store";
import {
  useAvailableRoomsByType,
  useRoomTypeAmenities,
  useRoomTypeById,
  useRoomTypeImages,
  useRoomTypes,
} from "@/hooks/rooms/rooms";
import { getFeatureIcon } from "@/components/room/feature-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreRoomTypesCard } from "@/components/room/more-room-types-card";

export default function RoomTypeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomTypeId = Number.parseInt(params?.id as string, 10);

  const { data: roomTypes } = useRoomTypes();
  const { data: roomType, isLoading } = useRoomTypeById(roomTypeId);
  const { data: amenities, isLoading: isAmenitiesLoading } =
    useRoomTypeAmenities(roomTypeId);
  const { data: images, isLoading: isImagesLoading } =
    useRoomTypeImages(roomTypeId);

  const filters = useStore((state) => state.filters);
  const checkIn = filters.checkIn;
  const checkOut = filters.checkOut;

  const { data: rooms } = useAvailableRoomsByType(
    roomTypeId,
    checkIn?.toISOString(),
    checkOut?.toISOString()
  );

  const availableRoomsCount = rooms?.length || 0;

  const setFilters = useStore((state) => state.setFilters);

  const handleViewAvailableRooms = () => {
    // Update filters with the selected room type
    // setFilters({ roomType: roomType });
    // Navigate to rooms page
    router.push("/rooms");
  };

  if (isLoading || !roomType) {
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
          <h1 className="text-3xl font-bold">{roomType.name}</h1>
          <div className="flex items-center mt-1">
            <Users className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">
              Up to {roomType.capacity} guests
            </span>
            {roomType.isResidential && (
              <Badge className="ml-2 bg-primary">Residential</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          {images && (
            <ImageCarousel
              images={images?.map((img) => img.url) || []}
              aspectRatio="video"
              className="rounded-lg overflow-hidden"
            />
          )}
          {(isImagesLoading || !images) && (
            <Skeleton className="h-96 w-full rounded-lg" />
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
                <p className="text-muted-foreground">{roomType.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Room Size</h3>
                    <p className="text-muted-foreground">
                      {roomType.isResidential ? "45-60" : "30-40"} m²
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Bed Type</h3>
                    <p className="text-muted-foreground">{roomType.bedType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">View</h3>
                    <p className="text-muted-foreground">{roomType.viewType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Max Occupancy</h3>
                    <p className="text-muted-foreground">
                      {roomType.capacity}{" "}
                      {roomType.capacity === 1 ? "Person" : "People"}
                    </p>
                  </div>
                </div>
              </div>

              {roomType.isResidential && (
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
                        <div className="text-2xl font-bold">
                          ${roomType.price}
                        </div>
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
                          ${roomType.weeklyRate}
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
                          ${roomType.monthlyRate}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${Math.round(roomType.monthlyRate ?? 0 / 30)}/night
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
                    {!isAmenitiesLoading &&
                      amenities &&
                      amenities?.map((amenity) => (
                        <li key={amenity.id} className="flex items-center">
                          {getFeatureIcon(amenity.name)}
                          <span className="ml-2">{amenity.name}</span>
                        </li>
                      ))}
                    {(isAmenitiesLoading || !amenities) && (
                      <li className="flex items-center">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                      </li>
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

          {/* Similar Room Types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Similar Room Types</h2>
              <Link href="/rooms">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all rooms
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomTypes &&
                roomTypes
                  .filter((rt) => rt.id !== roomType.id)
                  .slice(0, 2)
                  .map((rt) => <MoreRoomTypesCard key={rt.id} roomType={rt} />)}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book This Room Type</CardTitle>
              <CardDescription>
                {availableRoomsCount > 0
                  ? `${availableRoomsCount} ${
                      availableRoomsCount === 1 ? "room" : "rooms"
                    } available`
                  : "Currently no rooms available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                ${roomType.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / night
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Room Features:</h3>
                <ul className="space-y-1 text-sm">
                  {amenities?.slice(0, 5).map((amenity) => (
                    <li key={amenity.id} className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                      {amenity.name}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleViewAvailableRooms}
                >
                  View Available Rooms
                </Button>

                {/* <Link
                  href={`/reservation/new?roomType=${roomType.id}`}
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    Book Now
                  </Button>
                </Link> */}
              </div>

              {/* Payment Info */}
              <div className="flex items-center text-xs text-muted-foreground justify-center">
                <CreditCard className="h-3 w-3 mr-1" />
                No payment required today
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

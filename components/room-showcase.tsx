import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Coffee, Tv, Bath, Users } from "lucide-react"

export function RoomShowcase() {
  const rooms = [
    {
      id: 1,
      name: "Standard Room",
      description: "Comfortable room with all the essential amenities for a pleasant stay.",
      price: 120,
      image: "/placeholder.svg?height=400&width=600",
      features: ["Free WiFi", "Coffee Maker", "TV", "Private Bathroom"],
      capacity: 2,
      available: true,
    },
    {
      id: 2,
      name: "Deluxe Room",
      description: "Spacious room with premium amenities and a beautiful city view.",
      price: 180,
      image: "/placeholder.svg?height=400&width=600",
      features: ["Free WiFi", "Coffee Maker", "Smart TV", "Luxury Bathroom", "Mini Bar"],
      capacity: 2,
      available: true,
    },
    {
      id: 3,
      name: "Executive Suite",
      description: "Elegant suite with separate living area and premium amenities.",
      price: 250,
      image: "/placeholder.svg?height=400&width=600",
      features: ["Free WiFi", "Coffee Maker", "Smart TV", "Jacuzzi", "Mini Bar", "Lounge Area"],
      capacity: 3,
      available: false,
    },
    {
      id: 4,
      name: "Residential Suite",
      description: "Long-term stay suite with kitchen and all the comforts of home.",
      price: 350,
      image: "/placeholder.svg?height=400&width=600",
      features: ["Free WiFi", "Full Kitchen", "Smart TV", "Luxury Bathroom", "Living Room", "Dining Area"],
      capacity: 4,
      available: true,
      isResidential: true,
    },
  ]

  const getFeatureIcon = (feature: string) => {
    if (feature.includes("WiFi")) return <Wifi className="h-4 w-4" />
    if (feature.includes("Coffee")) return <Coffee className="h-4 w-4" />
    if (feature.includes("TV")) return <Tv className="h-4 w-4" />
    if (feature.includes("Bathroom") || feature.includes("Jacuzzi")) return <Bath className="h-4 w-4" />
    return null
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Rooms & Suites</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our selection of luxurious accommodations designed for your comfort and relaxation.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-8">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image src={room.image || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                {room.isResidential && <Badge className="absolute top-2 right-2 bg-primary">Residential</Badge>}
                {!room.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">
                      Fully Booked
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Up to {room.capacity} guests</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {room.features.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      {getFeatureIcon(feature)}
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold">
                    ${room.price}
                    <span className="text-sm font-normal text-muted-foreground"> / night</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/rooms/${room.id}`} className="w-full">
                  <Button variant="outline" className="w-full" disabled={!room.available}>
                    View Details
                  </Button>
                </Link>
                <Link href={`/reservation/new?roomId=${room.id}`} className="w-full ml-2">
                  <Button className="w-full" disabled={!room.available}>
                    Book Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/rooms">
            <Button variant="outline" size="lg">
              View All Rooms
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

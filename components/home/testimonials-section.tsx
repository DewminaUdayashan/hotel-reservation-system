import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Business Traveler",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "The service at LuxeStay was exceptional. The staff went above and beyond to address my concerns and make my stay comfortable.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Family Vacation",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "We had a wonderful family vacation at LuxeStay. The rooms were spacious, clean, and the amenities were perfect for our needs.",
      rating: 4,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Honeymoon Stay",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "Our honeymoon at LuxeStay was magical. The romantic package they arranged for us made our stay truly unforgettable.",
      rating: 5,
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              What Our Guests Say
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. Here's what our guests have to
              say about their experience with us.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex space-x-1 mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                </div>
                <p className="text-muted-foreground">"{testimonial.content}"</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex items-center space-x-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

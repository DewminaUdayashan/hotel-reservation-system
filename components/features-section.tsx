import { Clock, CreditCard, Utensils, Shirt, Phone, Key, Trophy, Building } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Clock className="h-10 w-10" />,
      title: "24/7 Service",
      description: "Our front desk is available around the clock to assist with your needs.",
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Flexible Payment",
      description: "Pay by cash or credit card at checkout for your convenience.",
    },
    {
      icon: <Utensils className="h-10 w-10" />,
      title: "Restaurant & Room Service",
      description: "Enjoy delicious meals at our restaurant or in the comfort of your room.",
    },
    {
      icon: <Shirt className="h-10 w-10" />,
      title: "Laundry Service",
      description: "Professional laundry service available for all guests.",
    },
    {
      icon: <Phone className="h-10 w-10" />,
      title: "Telephone Service",
      description: "Stay connected with our telephone service for local and international calls.",
    },
    {
      icon: <Key className="h-10 w-10" />,
      title: "Automatic Key Issuance",
      description: "Secure and convenient electronic key system for your room.",
    },
    {
      icon: <Trophy className="h-10 w-10" />,
      title: "Club Facility",
      description: "Access to our exclusive club with premium amenities and services.",
    },
    {
      icon: <Building className="h-10 w-10" />,
      title: "Residential Suites",
      description: "Long-term stay options with weekly and monthly rates available.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Hotel Features & Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover the exceptional amenities and services that make your stay with us truly memorable.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center">
              <div className="text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

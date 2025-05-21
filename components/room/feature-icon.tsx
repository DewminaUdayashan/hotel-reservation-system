import {
  AirVentIcon,
  Bath,
  Coffee,
  ForkKnife,
  SquareCheck,
  Tv,
  Wifi,
} from "lucide-react";

export const getFeatureIcon = (feature: string) => {
  if (feature.includes("WiFi")) return <Wifi className="h-4 w-4" />;
  if (feature.includes("Coffee")) return <Coffee className="h-4 w-4" />;
  if (feature.includes("TV")) return <Tv className="h-4 w-4" />;
  if (feature.includes("Bathroom") || feature.includes("Jacuzzi"))
    return <Bath className="h-4 w-4" />;
  if (feature.includes("Air Conditioning"))
    return <AirVentIcon className="h-4 w-4" />;
  if (feature.includes("Kitchen")) return <ForkKnife className="h-4 w-4" />;
  return <SquareCheck className="h-4 w-4" />;
};

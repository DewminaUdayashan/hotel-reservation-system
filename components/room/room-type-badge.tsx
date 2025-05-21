import { Badge } from "../ui/badge";

export const RoomTypeBadge = ({ type }: { type: string }) => {
  return <Badge className="absolute top-2 right-2 bg-primary">{type}</Badge>;
};

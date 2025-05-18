export type RoomStatus = "available" | "maintenance";

export type RoomType = {
  id: number;
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  capacity: number;
  price: number;
  weeklyRate?: number;
  monthlyRate?: number;
  isResidential?: boolean;
  bedType: string;
  view: string;
};

export type Room = {
  id: number;
  name: string;
  description: string;
  images: string[];
  status: RoomStatus;
  type: number;
  bedType: string;
  view: string;
};

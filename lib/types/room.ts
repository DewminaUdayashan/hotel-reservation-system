export type RoomStatus = "available" | "maintenance" | "occupied";

export type RoomType = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  weeklyRate?: number;
  monthlyRate?: number;
  isResidential?: boolean;
  bedType: string;
  viewType: string;
};

export type Room = {
  id: number;
  name: string;
  description: string;
  status: RoomStatus;
  type: number;
  bedType?: string;
  viewType?: string;
};

export type RoomWithType = Room & {
  roomTypeName: string;
  capacity: number;
  price: number;
  weeklyRate?: number;
  monthlyRate?: number;
  isResidential?: boolean;
  isReserved?: boolean;
};

export type Amenity = {
  id: number;
  name: string;
};

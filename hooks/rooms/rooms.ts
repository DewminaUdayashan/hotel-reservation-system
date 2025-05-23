"use client";

import { delay } from "@/lib/api";
import { Amenity, Room, RoomType, RoomWithType } from "@/lib/types/room";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { useReservations } from "../reservation";
import { isBetween, isDateRangeOverlapping, today } from "@/lib/utils/moment";
import { useMemo } from "react";
import { Image } from "@/lib/types/image";
import { useAxios } from "@/lib/axios";

const useRoomTypes = () => {
  return useQuery<RoomType[]>({
    queryKey: [queryKeys.roomTypes],
    queryFn: async () => {
      const res = await useAxios().get<RoomType[]>("/room-types");
      return res.data;
    },
  });
};

const useRoomTypeById = (id?: number) => {
  return useQuery({
    queryKey: [queryKeys.roomTypes, id],
    queryFn: async () => {
      const res = await useAxios().get<RoomType>(`/room-types/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

const useRoomTypeAmenities = (id?: number) => {
  return useQuery<Amenity[]>({
    queryKey: [queryKeys.roomTypes, queryKeys.amenities, id],
    queryFn: async () => {
      const res = await useAxios().get<Amenity[]>(
        `/room-types/${id}/amenities`
      );
      return res.data;
    },
    enabled: !!id,
  });
};

const useRoomTypeImages = (id?: number) => {
  return useQuery({
    queryKey: [queryKeys.roomTypes, queryKeys.images, id],
    queryFn: async () => {
      const res = await useAxios().get<Image[]>(`/room-types/${id}/images`);
      return res.data;
    },
    enabled: !!id,
  });
};

interface RoomFilters {
  checkIn?: string;
  checkOut?: string;
  type?: number;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
}

const useAllRooms = (filters: RoomFilters) => {
  const axios = useAxios();

  return useQuery<RoomWithType[]>({
    queryKey: [queryKeys.availableRooms, filters],
    queryFn: async () => {
      const res = await axios.get<RoomWithType[]>("/rooms", {
        params: filters,
      });
      return res.data;
    },
  });
};

const useRoomById = (roomId?: number) => {
  const axios = useAxios();

  return useQuery<RoomWithType>({
    queryKey: [queryKeys.rooms, roomId],
    queryFn: async () => {
      const res = await axios.get<RoomWithType>(`/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId, // avoid firing until roomId is set
  });
};

const useRoomAvailability = (
  roomId?: number,
  checkIn?: string,
  checkOut?: string,
  userId?: number
) => {
  const axios = useAxios();

  return useQuery({
    queryKey: [queryKeys.availableRooms, roomId, checkIn, checkOut, userId],
    enabled: !!roomId && !!checkIn && !!checkOut,
    queryFn: async () => {
      const res = await axios.get("/rooms/" + roomId + "/check-availability", {
        params: {
          checkIn,
          checkOut,
          userId,
        },
      });
      return res.data.isAvailable as boolean;
    },
  });
};

const useRoomImages = (roomId?: number) => {
  const axios = useAxios();

  return useQuery<Image[]>({
    queryKey: [queryKeys.rooms, queryKeys.images, roomId],
    queryFn: async () => {
      const res = await axios.get(`/rooms/${roomId}/images`);
      return res.data;
    },
    enabled: !!roomId,
  });
};

export const useAvailableRoomsByType = (
  roomTypeId?: number,
  checkIn?: string,
  checkOut?: string
) => {
  const axios = useAxios();

  return useQuery<Room[]>({
    queryKey: [
      queryKeys.rooms,
      queryKeys.roomTypes,
      queryKeys.availableRooms,
      roomTypeId,
      checkIn,
      checkOut,
    ],
    queryFn: async () => {
      const res = await axios.get(`/room-types/${roomTypeId}/available-rooms`, {
        params: { checkIn, checkOut },
      });
      return res.data;
    },
    enabled: !!roomTypeId,
  });
};

export {
  useAllRooms,
  useRoomTypeById,
  useRoomTypes,
  useRoomTypeAmenities,
  useRoomTypeImages,
  useRoomById,
  useRoomAvailability,
  useRoomImages,
};

"use client";

import { delay } from "@/lib/api";
import { rooms, roomTypes } from "@/lib/data";
import { Room } from "@/lib/types/room";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "./query-keys";
import { useReservations } from "./reservation";
import { isBetween, isDateRangeOverlapping, today } from "@/lib/utils/moment";
import { useMemo } from "react";

const useRoomTypes = () => {
  return useQuery({
    queryKey: [queryKeys.roomTypes],
    queryFn: async () => {
      // Simulate async fetch
      await delay(300);
      return roomTypes;
    },
  });
};

const useRoomTypeById = (id?: number) => {
  return useQuery({
    queryKey: [queryKeys.roomTypes, id],
    queryFn: async () => {
      await delay(200);
      const roomType = roomTypes.find((rt) => rt.id === id);
      if (!roomType) throw new Error("Room type not found");
      return roomType;
    },
    enabled: !!id,
  });
};

type UseAvailableRoomsByTypeProps = {
  roomType: number;
  availableOnly: boolean;
  checkIn?: Date;
  checkOut?: Date;
};

const useAvailableRoomsByType = ({
  roomType,
  availableOnly,
  checkIn,
  checkOut,
}: UseAvailableRoomsByTypeProps) => {
  const { data: reservations } = useReservations();

  return useQuery({
    queryKey: [
      queryKeys.rooms,
      roomType,
      availableOnly,
      checkIn?.toISOString(),
      checkOut?.toISOString(),
    ],
    queryFn: async () => {
      let filteredRooms = rooms.filter((room) => room.type === roomType);

      if (availableOnly && reservations && reservations.length > 0) {
        filteredRooms = filteredRooms.filter((room) => {
          const isReserved = reservations.some((res) => {
            if (res.roomId !== room.id) return false;

            const resCheckIn = new Date(res.checkIn);
            const resCheckOut = new Date(res.checkOut);

            const desiredStart = checkIn ?? today(); // default to today
            const desiredEnd = checkOut ?? today(); // default to today

            return isDateRangeOverlapping(
              desiredStart,
              desiredEnd,
              resCheckIn,
              resCheckOut
            );
          });

          return !isReserved && room.status === "available";
        });
      }

      return filteredRooms;
    },
    enabled: !!roomType,
  });
};

type UseAreAllRoomsUnavailableProps = {
  roomType?: number;
  checkIn: Date;
  checkOut: Date;
};

const useAreAllRoomsUnavailable = ({
  roomType,
  checkIn,
  checkOut,
}: UseAreAllRoomsUnavailableProps): boolean | undefined => {
  const { data: reservations, isLoading } = useReservations();

  const result = useMemo(() => {
    if (!reservations || isLoading) return undefined;

    const filteredRooms = rooms.filter((room) => room.type === roomType);

    const unavailableCount = filteredRooms.filter((room) => {
      return reservations.some((res) => {
        if (res.roomId !== room.id) return false;

        const resCheckIn = new Date(res.checkIn);
        const resCheckOut = new Date(res.checkOut);

        return isDateRangeOverlapping(
          checkIn,
          checkOut,
          resCheckIn,
          resCheckOut
        );
      });
    }).length;

    return unavailableCount === filteredRooms.length;
  }, [reservations, roomType, checkIn, checkOut, isLoading]);

  return result;
};

type UseAllRoomsProps = {
  roomType?: number;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceRange?: number[];
};

const useAllRooms = ({
  roomType,
  guests,
  checkIn,
  checkOut,
  priceRange,
}: UseAllRoomsProps) => {
  const { data: reservations } = useReservations();

  return useQuery({
    queryKey: [
      queryKeys.rooms,
      roomType,
      checkIn?.toISOString(),
      checkOut?.toISOString(),
      guests,
      priceRange,
    ],
    queryFn: () => {
      let filteredRooms = rooms;
      if (roomType) {
        filteredRooms = filteredRooms.filter((room) => room.type === roomType);
      }

      if (checkIn && checkOut) {
        filteredRooms = filteredRooms.filter((room) => {
          const isReserved = reservations?.some((res) => {
            if (res.roomId !== room.id) return false;
            const resCheckIn = new Date(res.checkIn);
            const resCheckOut = new Date(res.checkOut);
            return isDateRangeOverlapping(
              checkIn,
              checkOut,
              resCheckIn,
              resCheckOut
            );
          });
          return !isReserved && room.status === "available";
        });
      }

      if (guests) {
        filteredRooms = filteredRooms.filter((room) => {
          const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type);
          if (!roomTypeDetails) return false;
          return roomTypeDetails.capacity >= guests;
        });
      }

      if (priceRange) {
        filteredRooms = filteredRooms.filter((room) => {
          const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type);
          if (!roomTypeDetails) return false;
          return (
            roomTypeDetails.price >= priceRange[0] &&
            roomTypeDetails.price <= priceRange[1]
          );
        });
      }

      return filteredRooms;
    },
  });
};

const useRoomById = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.rooms, id],
    queryFn: async () => {
      await delay(200);
      const room = rooms.find((r) => r.id === id);
      if (!room) throw new Error("Room not found");

      const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type);
      return { ...room, ...roomTypeDetails };
    },
    enabled: !!id,
  });
};

export {
  useAllRooms,
  useRoomById,
  useRoomTypeById,
  useRoomTypes,
  useAvailableRoomsByType,
  useAreAllRoomsUnavailable,
};

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customers, reservations, rooms, roomTypes, travelCompanies, reports } from "./data"

// Utility function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Customer API
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      await delay(500)
      return customers
    },
  })
}

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      await delay(500)
      const customer = customers.find((c) => c.id === id)
      if (!customer) throw new Error("Customer not found")
      return customer
    },
    enabled: !!id,
  })
}

// Room API
export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      await delay(500)
      return rooms
    },
  })
}

export const useRoom = (id: number) => {
  return useQuery({
    queryKey: ["room", id],
    queryFn: async () => {
      await delay(500)
      const room = rooms.find((r) => r.id === id)
      if (!room) throw new Error("Room not found")

      const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type)
      return { ...room, ...roomTypeDetails }
    },
    enabled: !!id,
  })
}

export const useAvailableRooms = (checkIn: Date, checkOut: Date, roomType?: string) => {
  return useQuery({
    queryKey: ["availableRooms", checkIn, checkOut, roomType],
    queryFn: async () => {
      await delay(500)
      // In a real app, this would check against reservations
      let availableRooms = rooms.filter((r) => r.status === "available")

      if (roomType) {
        availableRooms = availableRooms.filter((r) => r.type === roomType)
      }

      return availableRooms
    },
    enabled: !!(checkIn && checkOut),
  })
}

// Reservation API
export const useReservations = () => {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      await delay(500)
      return reservations
    },
  })
}

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      await delay(500)
      const reservation = reservations.find((r) => r.id === id)
      if (!reservation) throw new Error("Reservation not found")

      const customer = customers.find((c) => c.id === reservation.customerId)
      const room = rooms.find((r) => r.id === reservation.roomId)
      const roomType = room ? roomTypes.find((rt) => rt.id === room.type) : null

      return {
        ...reservation,
        customer,
        room,
        roomType,
      }
    },
    enabled: !!id,
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newReservation: any) => {
      await delay(1000)
      // In a real app, this would send data to the server
      const id = `RES${Math.floor(1000 + Math.random() * 9000)}`
      const createdReservation = {
        id,
        ...newReservation,
        createdAt: new Date(),
        status: "reserved",
        additionalCharges: [],
      }

      return createdReservation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await delay(1000)
      // In a real app, this would update data on the server
      return { id, ...data }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
      queryClient.invalidateQueries({ queryKey: ["reservation", data.id] })
    },
  })
}

// Check-in/Check-out API
export const useCheckIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reservationId, roomId }: { reservationId: string; roomId: number }) => {
      await delay(1000)
      // In a real app, this would update the reservation and room status
      return { success: true, reservationId, roomId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
      queryClient.invalidateQueries({ queryKey: ["reservation", data.reservationId] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] })
    },
  })
}

export const useCheckOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reservationId,
      roomId,
      paymentMethod,
    }: { reservationId: string; roomId: number; paymentMethod: string }) => {
      await delay(1000)
      // In a real app, this would update the reservation and room status
      return { success: true, reservationId, roomId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
      queryClient.invalidateQueries({ queryKey: ["reservation", data.reservationId] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] })
    },
  })
}

// Reports API
export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      await delay(500)
      return reports
    },
  })
}

export const useGenerateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reportType, dateRange }: { reportType: string; dateRange: { start: Date; end: Date } }) => {
      await delay(2000)
      // In a real app, this would generate a report on the server
      return {
        id: `REP${Math.floor(1000 + Math.random() * 9000)}`,
        type: reportType,
        generated: new Date(),
        dateRange,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}

// Travel Companies API
export const useTravelCompanies = () => {
  return useQuery({
    queryKey: ["travelCompanies"],
    queryFn: async () => {
      await delay(500)
      return travelCompanies
    },
  })
}

export const useCreateBlockBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ companyId, bookingData }: { companyId: string; bookingData: any }) => {
      await delay(1000)
      // In a real app, this would create a block booking on the server
      return {
        id: `BB${Math.floor(1000 + Math.random() * 9000)}`,
        companyId,
        ...bookingData,
        status: "pending",
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelCompanies"] })
    },
  })
}

// Dashboard Stats API
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      await delay(700)
      // In a real app, this would fetch real-time stats from the server
      return {
        occupancyRate: 75,
        availableRooms: 12,
        reservedRooms: 8,
        occupiedRooms: 28,
        todayCheckIns: 5,
        todayCheckOuts: 3,
        revenue: {
          today: 1250,
          thisWeek: 8750,
          thisMonth: 32500,
        },
      }
    },
  })
}

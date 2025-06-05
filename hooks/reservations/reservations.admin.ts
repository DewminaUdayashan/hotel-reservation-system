import { useAxios } from "@/lib/axios";
import {
  AdminReservationResponse,
  PaymentMethod,
  ReservationStatusAction,
} from "@/lib/types/reservation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { InvoicePayload } from "@/lib/types/invoice";

type AdminReservationFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  hotelId?: number;
  status?: string;
  fromDate?: string; // ISO string
  toDate?: string; // ISO string
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
};

export const useAdminReservations = (filters: AdminReservationFilters) => {
  const axios = useAxios();

  return useQuery<AdminReservationResponse>({
    queryKey: [queryKeys.adminReservations, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize)
        params.append("pageSize", filters.pageSize.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.hotelId) params.append("hotelId", filters.hotelId.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.fromDate) params.append("fromDate", filters.fromDate);
      if (filters.toDate) params.append("toDate", filters.toDate);
      if (filters.orderBy) params.append("orderBy", filters.orderBy);
      if (filters.orderDir) params.append("orderDir", filters.orderDir);

      const res = await axios.get<AdminReservationResponse>(
        `/admin/reservations?${params.toString()}`
      );
      return res.data;
    },
    enabled: !!filters,
  });
};

export interface AdminUpdateReservationInput {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  cardHolderName?: string;
  maskedCardNumber?: string;
  cardType?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
}

export function useAdminUpdateReservation(id: number) {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: AdminUpdateReservationInput) => {
      const res = await axios.post(`/admin/reservations/${id}/update`, data);
      return res.data;
    },
  });
}

export const useUpdateReservationStatus = (id: number) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      userName,
      email,
    }: {
      action: ReservationStatusAction;
      userName?: string;
      email?: string;
    }) => {
      const res = await axios.post(`/admin/reservations/${id}/status`, {
        action,
        userName: userName || null,
        email: email || null,
      });
      return res.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.adminReservations],
      });
    },
  });
};

export const useCheckoutAndBilling = (id: number) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lineItems,
      paymentMethod,
      amountPaid,
      transactionId,
      dueDate,
      userName,
      email,
    }: InvoicePayload) => {
      const response = await axios.post(`/admin/reservations/${id}/checkout`, {
        userName: userName || null,
        email: email || null,
        lineItems,
        paymentMethod,
        amountPaid,
        transactionId: transactionId || null,
        dueDate,
      });
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.adminReservations],
      });
    },
  });
};

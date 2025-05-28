import { useAxios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { HotelUser, UserRole } from "@/lib/types/user";

type Options = {
  page?: number;
  pageSize?: number;
  search?: string;
  customerType?: string;
  orderBy?: string;
  orderDir?: string;
};

export const useAdminCustomers = (options: Options) => {
  const axios = useAxios();

  return useQuery({
    queryKey: [queryKeys.adminCustomers, options],
    queryFn: async () => {
      const res = await axios.get("/admin/customers", {
        params: options,
      });
      return res.data;
    },
  });
};

export type CreateCustomerPayload = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  homeTown?: string;
  customerType?: "individual" | "agency";
  agencyId?: number;
  agencyName?: string;
  agencyPhone?: string;
};

export const useCreateCustomer = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: CreateCustomerPayload) => {
      const res = await axios.post("/admin/customers/create", data);
      return res.data;
    },
  });
};

type QueryParams = {
  page?: number;
  search?: string;
  role?: string;
  hotelId?: number;
  orderBy?: string;
  orderDir?: string;
};

export const useAdminUsers = (params: QueryParams) => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const res = await axios.get("/admin/users", { params });
      return res.data as { data: HotelUser[]; totalCount: number };
    },
  });
};

type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export function useCreateAdminUser() {
  const axios = useAxios();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await axios.post("/admin/users/create", data);
      return res.data;
    },
  });
}

export function useAssignUserToHotel() {
  const axios = useAxios();
  return useMutation({
    mutationFn: async ({
      userId,
      hotelId,
    }: {
      userId: number;
      hotelId: number;
    }) => {
      const res = await axios.post(`/admin/users/${userId}/assign-hotel`, {
        hotelId,
      });
      return res.data;
    },
  });
}

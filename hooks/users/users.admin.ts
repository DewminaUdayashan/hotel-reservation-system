import { useAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";

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

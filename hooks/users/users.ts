import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types/user";
import queryKeys from "../query-keys";
import { useAxios } from "@/lib/axios";

export const useUserById = (userId?: number) => {
  const axios = useAxios();

  return useQuery<User>({
    queryKey: [queryKeys.users, userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await axios.get<User>(`/users/${userId}`);
      return res.data;
    },
  });
};

import { useAxios } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../query-keys";

export function useAdminCreateRoom() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post("/admin/rooms/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.rooms],
      });
    },
  });
}

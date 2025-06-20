import { useAxios } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../query-keys";

export function useAdminCreateHotel() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post("/admin/hotels/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.hotels],
      });
    },
  });
}

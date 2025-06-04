import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";

type VerifyEmailPayload = {
  email: string;
  token: string;
};

export const useVerifyEmail = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: VerifyEmailPayload): Promise<boolean> => {
      const res = await axios.post("/auth/verify-email", data);
      if (res.data.success) {
        return true;
      }
      return false;
    },
  });
};

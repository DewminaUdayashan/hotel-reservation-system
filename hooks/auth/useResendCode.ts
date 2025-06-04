import { useAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { LoginResponse, RegisterPayload } from "@/lib/types/auth";

type ResendCodePayload = {
  email: string;
  user: string;
  token?: string;
};

export const useResendCode = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (payload: ResendCodePayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/update-verification-token", payload);
      return res.data;
    },
  });
};

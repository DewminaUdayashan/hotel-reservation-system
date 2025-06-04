import { useAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { LoginResponse, RegisterPayload } from "@/lib/types/auth";

export const useRegister = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/register", payload);
      return res.data;
    },
  });
};

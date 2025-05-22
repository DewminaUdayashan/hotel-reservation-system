import { useAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { LoginPayload, LoginResponse, RegisterPayload } from "@/lib/types/auth";

export const useRegister = () => {
  const axios = useAxios();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/register", payload);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token); // Save to context
    },
  });
};

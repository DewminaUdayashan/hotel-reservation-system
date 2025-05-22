import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";
import { LoginPayload, LoginResponse } from "@/lib/types/auth";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const axios = useAxios();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginPayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/login", data);

      login(res.data.user, res.data.token); // Save to context

      return res.data;
    },
  });
};

import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";
import { LoginPayload, LoginResponse } from "@/lib/types/auth";

export const useLogin = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: LoginPayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/login", data);

      // Save token to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", res.data.token);
      }

      return res.data;
    },
  });
};

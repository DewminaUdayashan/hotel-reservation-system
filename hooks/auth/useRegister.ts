import { useAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useAuth } from "./useAuth";
import { LoginPayload, LoginResponse } from "@/lib/types/auth";

export const useRegister = () => {
  const axios = useAxios();
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      const res = await axios.post("/auth/register", payload);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token); // Save to context
      router.push("/dashboard"); // Redirect on success
    },
  });
};

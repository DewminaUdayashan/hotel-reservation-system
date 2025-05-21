import axios from "axios";

export const useAxios = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const instance = axios.create({
    baseURL: "/api",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return instance;
};

import axios from "axios";

// Create a singleton axios instance
const axiosInstance = axios.create({
  baseURL: "/api", // Adjust if your API is hosted elsewhere
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage on each request
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axiosInstance;

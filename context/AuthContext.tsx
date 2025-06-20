"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/user";
import { Customer, Agency, HotelUser } from "@/lib/types/user";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  customer: Customer | null;
  agency: Agency | null;
  hotelUser: HotelUser | null;
  login: (
    user: User,
    token?: string,
    options?: { customer?: Customer; agency?: Agency; hotelUser?: HotelUser }
  ) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [hotelUser, setHotelUser] = useState<HotelUser | null>(null);
  const router = useRouter();

  const login = (
    user: User,
    token?: string,
    options?: { customer?: Customer; agency?: Agency; hotelUser?: HotelUser }
  ) => {
    if (token) localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    if (options?.customer)
      localStorage.setItem("authCustomer", JSON.stringify(options.customer));
    if (options?.agency)
      localStorage.setItem("authAgency", JSON.stringify(options.agency));
    if (options?.hotelUser)
      localStorage.setItem("authHotelUser", JSON.stringify(options.hotelUser));
    if (token) setToken(token);
    setUser(user);
    setCustomer(options?.customer || null);
    setAgency(options?.agency || null);
    setHotelUser(options?.hotelUser || null);

    toast({
      title: "Logged in",
      description: "You have been logged in successfully.",
      variant: "default",
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authCustomer");
    localStorage.removeItem("authAgency");
    localStorage.removeItem("authHotelUser");

    setToken(null);
    setUser(null);
    setCustomer(null);
    setAgency(null);
    setHotelUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    const storedCustomer = localStorage.getItem("authCustomer");
    const storedAgency = localStorage.getItem("authAgency");
    const storedHotelUser = localStorage.getItem("authHotelUser");

    if (storedToken && storedUser) {
      try {
        const decoded: any = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          logout();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedCustomer) setCustomer(JSON.parse(storedCustomer));
          if (storedAgency) setAgency(JSON.parse(storedAgency));
          if (storedHotelUser) setHotelUser(JSON.parse(storedHotelUser));
        }
      } catch {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        customer,
        agency,
        hotelUser,
        login,
        logout,
        isAdmin: user?.role !== "customer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext)!;

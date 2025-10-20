/* eslint-disable */
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { config } from "@/Data/config";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext({
  user: null,
  loading: true,
  error: null,
  refetchUser: () => {},
});

export default function UserProvider({ children }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const userQuery = useQuery({
    queryKey: ["currentUser", token],
    queryFn: async () => {
      if (!token) throw new Error("No token found");

      const userToken = jwtDecode(token);
      if (!userToken?.id) throw new Error("Invalid token: missing user ID");

      const res = await fetch(
        `${config.baseUrl}/api/shop/getshop/${userToken.id}`,
        {
          headers: { authorization: "Bearer " + token },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("Fetched user data:", data);  
      if (data.status !== "success" || !data.data)
        throw new Error(data.message || "Failed to fetch user");

      return data.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const value = {
    user: userQuery.data,
    loading: userQuery.isLoading,
    error: userQuery.error?.message,
    refetchUser: userQuery.refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);

/* eslint-disable react/prop-types */
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

const UserContext = createContext({
  user: null,
  loading: true,
  error: null,
});

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userToken = jwtDecode(token);

        if (!userToken?.id) {
          throw new Error("Invalid token: missing user ID");
        }

        const userDetails = await fetch(
          `${DOMAIN_NAME}/api/shop/getshop/${userToken.id}`,
          {
            method: "GET",
            headers: {
              authorization: "Bearer " + token,
            },
          }
        );

        if (!userDetails.ok) {
          throw new Error(`HTTP error! status: ${userDetails.status}`);
        }

        const userRes = await userDetails.json();

        if (userRes.status === "success" && userRes.data) {
          setUser(userRes.data);
        } else {
          throw new Error(userRes.message || "Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array - only run once on mount

  const updateUserContext = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, cannot update user context");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userToken = jwtDecode(token);

      if (!userToken?.id) {
        throw new Error("Invalid token: missing user ID");
      }

      const userDetails = await fetch(
        `${DOMAIN_NAME}/api/shop/getshop/${userToken.id}`,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + token,
          },
        }
      );

      if (!userDetails.ok) {
        throw new Error(`HTTP error! status: ${userDetails.status}`);
      }

      const userRes = await userDetails.json();

      if (userRes.status === "success" && userRes.data) {
        setUser(userRes.data);
      } else {
        throw new Error(userRes.message || "Failed to update user data");
      }
    } catch (err) {
      console.error("Error updating user data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, error, updateUserContext };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  return useContext(UserContext);
};

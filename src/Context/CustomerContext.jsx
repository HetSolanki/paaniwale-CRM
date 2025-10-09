/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;
const CustomerContext = createContext();

export default function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchCustomerData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const customerDetails = await fetch(
          `${DOMAIN_NAME}/api/customers/customerall`,
          {
            method: "GET",
            headers: {
              authorization: "Bearer " + token,
            },
          }
        );

        if (!customerDetails.ok) {
          throw new Error(`HTTP error! status: ${customerDetails.status}`);
        }

        const customerRes = await customerDetails.json();

        if (customerRes.status === "success" && customerRes.data) {
          setCustomer(customerRes.data);
        } else {
          throw new Error(customerRes.message || "Failed to fetch customers");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []); // Empty dependency array - only run once on mount

  const updateCustomerContext = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, cannot update customer context");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const customerDetails = await fetch(
        `${DOMAIN_NAME}/api/customers/customerall`,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + token,
          },
        }
      );

      if (!customerDetails.ok) {
        throw new Error(`HTTP error! status: ${customerDetails.status}`);
      }

      const customerRes = await customerDetails.json();

      if (customerRes.status === "success" && customerRes.data) {
        setCustomer(customerRes.data);
      } else {
        throw new Error(customerRes.message || "Failed to update customers");
      }
    } catch (err) {
      console.error("Error updating customers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = { customer, loading, error, updateCustomerContext };
  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => {
  return useContext(CustomerContext);
};

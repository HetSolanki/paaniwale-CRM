/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;
const PaymentDetailContext = createContext();

export default function PaymentDetailProvider({ children }) {
  const [paymentdata, setPaymentdata] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPaymentData = async () => {
      const paymentDetails = await fetch(
        `${DOMAIN_NAME}/api/customers/customerall`,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + token,
          },
        }
      );
      const paymentRes = await paymentDetails.json();
      setPaymentdata(paymentRes.data);
      
    };
    if (token)
      fetchPaymentData();
      
  }, []);

  const updatePaymentDetailContext = async () => {
    const paymentDetails = await fetch(
      `${DOMAIN_NAME}/api/customers/customerall`,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + token,
        },
      }
    );

    const paymentRes = await paymentDetails.json();
    setPaymentdata(paymentRes.data);
  };

  const value = { paymentdata, updatePaymentDetailContext };
  return (
    <PaymentDetailContext.Provider value={value}>
      {children}
    </PaymentDetailContext.Provider>
  );
}

export const usePaymentDetail = () => {
  return useContext(PaymentDetailContext);
};

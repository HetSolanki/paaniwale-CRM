import { config } from "@/Data/config";

export const updatePaymentStatus = async (paymentId, statusData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${config.baseUrl}/api/paymentdetails/updatepaymentdetails/${paymentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify(statusData),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to update payment status",
      };
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      message: error.message || "Error updating payment status",
    };
  }
};

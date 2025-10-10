import { config } from "@/Data/config";

export const updateBankDetails = async (data, uid) => {
  const user = await fetch(
    `${config.baseUrl}/api/auth/user/bankdetails/${uid}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        branch_ifsc_code: data.branch_ifsc_code,
        account_number: data.account_number,
        benificiary_name: data.benificiary_name,
      }),
    }
  );

  return user.json();
};

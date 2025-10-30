import { config } from "@/Data/config";

export const GetdashboardData = async () => {
  const data = await fetch(
    `${config.baseUrl}/api/customerentry/getdashboarddata/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );

  const response = await data.json();

  return response;
};

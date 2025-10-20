import { config } from "@/Data/config";

export const getadmindashborddata = async () => {
  const data = await fetch(
    `${config.baseUrl}/api/auth/admin/admindashboardData`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );

  if (!data.ok) {
    console.log(data);
  }

  let res = {
    status: data.status,
    data: await data.json(),
  };

  return res;
};

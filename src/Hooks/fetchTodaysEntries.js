import { config } from "@/Data/config";

export const fetchTodaysEntries = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found!");
    }

    const res = await fetch(
      `${config.baseUrl}/api/customerentry/getTodaysEntries`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP Error: status ${res.status}`);

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch customers entries");
    }

    console.log(data);  
    return data.data;
  } catch (e) {
    console.log(e.message);
  }
};

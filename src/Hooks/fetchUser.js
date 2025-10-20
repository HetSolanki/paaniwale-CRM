import { config } from "@/Data/config";

export const fetchUser = async ({ queryKey }) => {
  const uid = queryKey[1];

  const user = await fetch(`${config.baseUrl}/api/auth/user/${uid}`);

  const userRes = await user.json();

  if (userRes.status === "success") {
    return userRes;
  }
};

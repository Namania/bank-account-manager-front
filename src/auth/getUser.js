import client from "../api/client";

export const getUser = async () => {
  const response = await client.get("/users/me/");
  return response.data;
};

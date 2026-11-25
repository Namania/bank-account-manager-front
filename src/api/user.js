import client from "./client";

export const updateProfile = async (data) => {
    const response = await client.patch("/users/me/", data);
    return response.data;
};

// Signs every other session out; the API renews this session's cookies itself.
export const changePassword = async ({ currentPassword, newPassword }) => {
    await client.post("/users/me/password/", {
        current_password: currentPassword,
        new_password: newPassword,
    });
};

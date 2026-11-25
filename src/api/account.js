import client from "./client";

const API_URL = import.meta.env.VITE_API_URL;

export const getAccounts = async () => {
    const response = await client.get(`${API_URL}/accounts/`);
    // A plain array; older API versions wrapped it in a page object.
    return response.data.results ?? response.data;
};

export const getAccount = async (id) => {
    const response = await client.get(`${API_URL}/accounts/${id}/`);
    return response.data;
}

export const createAccount = async (data) => {
    const response = await client.post(`${API_URL}/accounts/`, data);
    return response.data;
}

export const updateAccount = async (id, data) => {
    const response = await client.patch(`${API_URL}/accounts/${id}/`, data);
    return response.data;
}

// The API deactivates the account instead of removing it.
export const deleteAccount = async (id) => {
    const response = await client.delete(`${API_URL}/accounts/${id}/`);
    return response.data;
}

export const shareAccount = async (id, username) => {
    const response = await client.post(`${API_URL}/accounts/${id}/share/`, { username });
    return response.data;
}

export const unshareAccount = async (id, username) => {
    await client.post(`${API_URL}/accounts/${id}/unshare/`, { username });
}

// CSV or OFX statement, 1 MB at most. Answers { created, skipped, errors: [{ line, error }] }.
export const importStatement = async (id, file) => {
    const form = new FormData();
    form.append("file", file);
    const response = await client.post(`${API_URL}/accounts/${id}/import/`, form);
    return response.data;
}

// Counterparty of every external credit and debit.
export const getBankAccount = async () => {
    const response = await client.get(`${API_URL}/accounts/bank/`);
    return response.data;
}

// Transaction filters, named after the API query parameters. "" means not set.
export const EMPTY_FILTERS = {
    date_from: "",
    date_to: "",
    category: "",
    account: "",
    amount_min: "",
    amount_max: "",
    search: "",
    ordering: "",
};

export const hasFilters = (filters) => Object.values(filters).some((value) => value !== "");

const LOCALES = { fr: "fr-FR", en: "en-GB" };

export const toLocale = (language) => LOCALES[language] ?? LOCALES.fr;

// The API exchanges amounts in euros, as 2-decimal strings.
export const formatMoney = (value, language) =>
    new Intl.NumberFormat(toLocale(language), { style: "currency", currency: "EUR" }).format(parseFloat(value));

// Amount typed by the user, as the API expects it. null when not strictly positive.
export const toEuros = (value) => {
    const amount = parseFloat(value);
    return amount > 0 ? amount.toFixed(2) : null;
};

// "2026-11-25" is a calendar day, not an instant: build it in local time so it
// never shifts to the day before west of Greenwich.
export const parseDay = (day) => {
    const [year, month, date] = day.split("-").map(Number);
    return new Date(year, month - 1, date);
};

export const formatDay = (day, language, options = { day: "numeric", month: "short", year: "numeric" }) =>
    day ? parseDay(day).toLocaleDateString(toLocale(language), options) : "-";

// Today as YYYY-MM-DD, in local time.
export const today = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

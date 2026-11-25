import { describe, expect, it } from "vitest";
import { formatDay, formatMoney, formatMonth, parseDay, toEuros, today, toLocale } from "./format";
import { EMPTY_FILTERS, hasFilters } from "./filters";

describe("toEuros", () => {
    it("formats a typed amount as the API expects it", () => {
        expect(toEuros("10.5")).toBe("10.50");
        expect(toEuros("19.99")).toBe("19.99");
        expect(toEuros(3)).toBe("3.00");
    });

    it("refuses anything that is not strictly positive", () => {
        expect(toEuros("0")).toBeNull();
        expect(toEuros("-5")).toBeNull();
        expect(toEuros("")).toBeNull();
        expect(toEuros("abc")).toBeNull();
    });
});

describe("dates", () => {
    it("reads a calendar day in local time, never the day before", () => {
        const day = parseDay("2026-11-25");
        expect([day.getFullYear(), day.getMonth(), day.getDate()]).toEqual([2026, 10, 25]);
    });

    it("formats a day and a month in the interface language", () => {
        expect(formatDay("2026-01-05", "fr")).toBe("5 janv. 2026");
        expect(formatDay("2026-01-05", "en")).toBe("5 Jan 2026");
        expect(formatDay(null, "fr")).toBe("-");
        expect(formatMonth("2026-03", "fr", { month: "long", year: "numeric" })).toBe("mars 2026");
    });

    it("gives today as YYYY-MM-DD", () => {
        expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("formatMoney", () => {
    it("shows euros from the API's decimal strings", () => {
        // Intl uses narrow no-break spaces: compare without any spacing.
        const plain = (value, language) => formatMoney(value, language).replace(/\s/g, "");
        expect(plain("1234.50", "fr")).toBe("1234,50€");
        expect(plain("-3.20", "fr")).toBe("-3,20€");
        expect(plain("1234.50", "en")).toBe("€1,234.50");
    });

    it("falls back to French for an unknown language", () => {
        expect(toLocale("de")).toBe("fr-FR");
    });
});

describe("hasFilters", () => {
    it("is false until one filter is set", () => {
        expect(hasFilters(EMPTY_FILTERS)).toBe(false);
        expect(hasFilters({ ...EMPTY_FILTERS, category: "none" })).toBe(true);
    });
});

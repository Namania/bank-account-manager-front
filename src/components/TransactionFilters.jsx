import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDownIcon, FilterIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EMPTY_FILTERS, hasFilters } from "@/lib/filters";

const ALL = "all";
const ORDERINGS = ["-date", "date", "-amount", "amount", "-created_at", "created_at"];

/**
 * Filter bar for a transaction list. Nothing is sent while typing: the
 * filters apply on submit. Pass `accounts` to offer the account filter.
 */
export default function TransactionFilters({ value, onChange, categories = [], accounts = null }) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState(value);
    // On a phone the form is folded away until asked for.
    const [open, setOpen] = useState(false);
    const active = Object.values(value).filter((item) => item !== "").length;

    const set = (key) => (next) => setDraft((current) => ({ ...current, [key]: next }));
    const setFromInput = (key) => (event) => set(key)(event.target.value);
    const fromSelect = (key) => (next) => set(key)(next === ALL ? "" : next);

    const handleSubmit = (event) => {
        event.preventDefault();
        onChange(draft);
        setOpen(false);
    };

    const handleReset = () => {
        setDraft(EMPTY_FILTERS);
        onChange(EMPTY_FILTERS);
    };

    return (
        <div className="space-y-2">
        <Button
            type="button"
            variant="outline"
            className="md:hidden w-full justify-between"
            aria-expanded={open}
            aria-controls="transaction-filters"
            onClick={() => setOpen((current) => !current)}
        >
            <span className="flex items-center gap-2"><FilterIcon /> {t("transaction.filters.title")}</span>
            <span className="flex items-center gap-2">
                {active > 0 && <Badge>{active}</Badge>}
                <ChevronDownIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </span>
        </Button>
        <form id="transaction-filters" onSubmit={handleSubmit} className={`rounded-md border bg-card p-4 gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-8 items-end ${open ? "grid" : "hidden"} md:grid`}>
            <div className="space-y-1 col-span-2">
                <Label htmlFor="filter-search">{t("transaction.filters.search")}</Label>
                <Input id="filter-search" value={draft.search} maxLength={200} placeholder={t("transaction.filters.search_placeholder")} onChange={setFromInput("search")} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="filter-from">{t("transaction.filters.date_from")}</Label>
                <Input id="filter-from" type="date" value={draft.date_from} max={draft.date_to || undefined} onChange={setFromInput("date_from")} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="filter-to">{t("transaction.filters.date_to")}</Label>
                <Input id="filter-to" type="date" value={draft.date_to} min={draft.date_from || undefined} onChange={setFromInput("date_to")} />
            </div>
            <div className="space-y-1">
                <Label>{t("transaction.table.category")}</Label>
                <Select value={draft.category || ALL} onValueChange={fromSelect("category")}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>{t("transaction.filters.all")}</SelectItem>
                        <SelectItem value="none">{t("transaction.no_category")}</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>{category.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {accounts && (
                <div className="space-y-1">
                    <Label>{t("transaction.filters.account")}</Label>
                    <Select value={draft.account || ALL} onValueChange={fromSelect("account")}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t("transaction.filters.all")}</SelectItem>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={String(account.id)}>{account.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="space-y-1">
                <Label htmlFor="filter-min">{t("transaction.filters.amount_min")}</Label>
                <Input id="filter-min" type="number" step="0.01" min="0" placeholder="0.00" value={draft.amount_min} onChange={setFromInput("amount_min")} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="filter-max">{t("transaction.filters.amount_max")}</Label>
                <Input id="filter-max" type="number" step="0.01" min="0" placeholder="0.00" value={draft.amount_max} onChange={setFromInput("amount_max")} />
            </div>
            <div className="space-y-1">
                <Label>{t("transaction.filters.ordering")}</Label>
                <Select value={draft.ordering || ORDERINGS[0]} onValueChange={(next) => set("ordering")(next === ORDERINGS[0] ? "" : next)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {ORDERINGS.map((ordering) => (
                            <SelectItem key={ordering} value={ordering}>{t(`transaction.filters.orderings.${ordering}`)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2 col-span-2 md:col-span-1">
                <Button type="submit" className="flex-1">
                    <FilterIcon /> {t("transaction.filters.apply")}
                </Button>
                {hasFilters(value) && (
                    <Button type="button" variant="outline" size="icon" aria-label={t("transaction.filters.reset")} title={t("transaction.filters.reset")} onClick={handleReset}>
                        <XIcon />
                    </Button>
                )}
            </div>
        </form>
        </div>
    );
}

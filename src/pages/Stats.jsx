import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccounts } from "@/api/account";
import { getMonthlyStats, getStatsByCategory } from "@/api/stats";
import BalanceChart from "@/components/charts/BalanceChart";
import MonthlyFlowChart from "@/components/charts/MonthlyFlowChart";
import FadeAnimation from "@/components/animation/FadeAnimation";
import { formatMoney, formatMonth } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import AnimatedMoney from "@/components/animation/AnimatedMoney";
import { StaggerGroup, StaggerItem } from "@/components/animation/Stagger";
import { ScaleIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

const ALL = "all";

const sum = (rows, key) => rows.reduce((total, row) => total + parseFloat(row[key]), 0);

function StatTile({ label, value, icon: Icon, chip }) {
    return (
        <Card className="gap-2 py-4 h-full transition-shadow hover:shadow-md">
            <CardHeader className="px-4 flex flex-row items-center justify-between space-y-0">
                <CardDescription className="text-xs uppercase font-semibold tracking-wider">{label}</CardDescription>
                <span aria-hidden="true" className={`flex size-9 items-center justify-center rounded-lg ${chip}`}>
                    <Icon className="size-4" />
                </span>
            </CardHeader>
            <CardContent className="px-4">
                <AnimatedMoney value={value} className="text-2xl font-black" />
            </CardContent>
        </Card>
    );
}

// Expense per category as labelled bars: one hue for the magnitude, the
// category's own colour only as a swatch beside its name.
function CategoryBreakdown({ rows }) {
    const { t, i18n } = useTranslation();
    const spending = rows.filter((row) => parseFloat(row.expense) > 0);
    const largest = Math.max(...spending.map((row) => parseFloat(row.expense)), 0);

    if (spending.length === 0) {
        return <p className="text-sm text-muted-foreground italic py-6 text-center">{t("stats.empty")}</p>;
    }

    return (
        <ul className="space-y-3">
            {spending.map((row) => (
                <li key={row.category ?? "none"} className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                            <span className="inline-block size-2.5 shrink-0 rounded-full border" style={{ backgroundColor: row.color ?? "transparent" }} />
                            <span className="truncate">{row.category == null ? t("transaction.no_category") : row.label}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{formatMoney(row.expense, i18n.language)}</span>
                    </div>
                    <Progress
                        value={Math.max(1, (parseFloat(row.expense) / largest) * 100)}
                        aria-label={row.category == null ? t("transaction.no_category") : row.label}
                        className="bg-muted [&>[data-slot=progress-indicator]]:bg-chart-1"
                    />
                </li>
            ))}
        </ul>
    );
}

export default function Stats() {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const [accounts, setAccounts] = useState([]);
    const [filters, setFilters] = useState({ date_from: "", date_to: "", account: "" });
    const [months, setMonths] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAccounts().then(setAccounts).catch(() => toast.error(t("core.fetch_error")));
    }, [t]);

    useEffect(() => {
        let ignore = false;
        const fetchStats = async () => {
            try {
                const [monthly, byCategory] = await Promise.all([getMonthlyStats(filters), getStatsByCategory(filters)]);
                if (ignore) return;
                setMonths(monthly);
                setCategories(byCategory);
            } catch {
                if (!ignore) toast.error(t("core.fetch_error"));
            } finally {
                if (!ignore) setIsLoading(false);
            }
        };
        fetchStats();
        return () => { ignore = true; };
    }, [filters, t]);

    const setFilter = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }));
    const hasActivity = months.some((month) => parseFloat(month.income) > 0 || parseFloat(month.expense) > 0);

    return (
        <FadeAnimation delay={.2} className="p-3 sm:p-6 space-y-6">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                    <Label htmlFor="stats-from">{t("transaction.filters.date_from")}</Label>
                    <Input id="stats-from" type="date" value={filters.date_from} max={filters.date_to || undefined} onChange={(event) => setFilter("date_from")(event.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="stats-to">{t("transaction.filters.date_to")}</Label>
                    <Input id="stats-to" type="date" value={filters.date_to} min={filters.date_from || undefined} onChange={(event) => setFilter("date_to")(event.target.value)} />
                </div>
                <div className="space-y-1 min-w-48">
                    <Label>{t("transaction.filters.account")}</Label>
                    <Select value={filters.account || ALL} onValueChange={(value) => setFilter("account")(value === ALL ? "" : value)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t("stats.all_accounts")}</SelectItem>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={String(account.id)}>{account.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <StaggerGroup className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <StaggerItem><StatTile label={t("stats.income")} value={sum(months, "income")} icon={TrendingUpIcon} chip="bg-chart-2/15 text-chart-2" /></StaggerItem>
                <StaggerItem><StatTile label={t("stats.expense")} value={sum(months, "expense")} icon={TrendingDownIcon} chip="bg-chart-1/15 text-chart-1" /></StaggerItem>
                <StaggerItem><StatTile label={t("stats.net")} value={sum(months, "net")} icon={ScaleIcon} chip="bg-chart-3/15 text-chart-3" /></StaggerItem>
            </StaggerGroup>

            {!isLoading && !hasActivity ? (
                <Card className="border-dashed border-muted bg-muted/0 p-12 text-center text-muted-foreground italic">
                    {t("stats.empty")}
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("stats.monthly.title")}</CardTitle>
                                <CardDescription>{t("stats.monthly.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MonthlyFlowChart months={months} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("stats.balance.title")}</CardTitle>
                                <CardDescription>{t("stats.balance.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BalanceChart months={months} className="h-[280px] w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 items-start">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("stats.categories.title")}</CardTitle>
                                <CardDescription>{t("stats.categories.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CategoryBreakdown rows={categories} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("stats.table.title")}</CardTitle>
                                <CardDescription>{t("stats.table.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("stats.table.month")}</TableHead>
                                            <TableHead className="text-right">{t("stats.income")}</TableHead>
                                            <TableHead className="text-right">{t("stats.expense")}</TableHead>
                                            <TableHead className="text-right">{t("stats.net")}</TableHead>
                                            <TableHead className="text-right">{t("stats.balance_end")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...months].reverse().map((month) => (
                                            <TableRow key={month.month}>
                                                <TableCell>{formatMonth(month.month, language, { month: "long", year: "numeric" })}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatMoney(month.income, language)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatMoney(month.expense, language)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatMoney(month.net, language)}</TableCell>
                                                <TableCell className="text-right tabular-nums font-semibold">{formatMoney(month.balance, language)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </FadeAnimation>
    );
}

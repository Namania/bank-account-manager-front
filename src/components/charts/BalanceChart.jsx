import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { formatMoney, formatMonth, toLocale } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

const compact = (value, language) =>
    new Intl.NumberFormat(toLocale(language), { notation: "compact", maximumFractionDigits: 1 }).format(value);

/**
 * End-of-month balance over time, from GET /stats/monthly/.
 * One series: the title names it, so there is no legend.
 */
export default function BalanceChart({ months, height = 220 }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const data = months.map((month) => ({ month: month.month, balance: parseFloat(month.balance) }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 8, left: 0, right: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickFormatter={(month) => formatMonth(month, language, { month: "short", year: "2-digit" })}
                />
                <YAxis
                    width={48}
                    tickLine={false}
                    axisLine={false}
                    tickCount={4}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickFormatter={(value) => compact(value, language)}
                />
                <Tooltip
                    cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const point = payload[0].payload;
                        return (
                            <ChartTooltip
                                title={formatMonth(point.month, language, { month: "long", year: "numeric" })}
                                rows={[{ label: t("stats.balance_end"), value: formatMoney(point.balance, language), color: "var(--viz-1)" }]}
                            />
                        );
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--viz-1)"
                    strokeWidth={2}
                    dot={data.length <= 12 ? { r: 3, fill: "var(--viz-1)", stroke: "var(--card)", strokeWidth: 2 } : false}
                    activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

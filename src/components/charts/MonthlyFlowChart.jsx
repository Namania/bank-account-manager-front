import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { formatMoney, formatMonth, toLocale } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

const compact = (value, language) =>
    new Intl.NumberFormat(toLocale(language), { notation: "compact", maximumFractionDigits: 1 }).format(value);

/**
 * Income and expense per month, side by side on one axis.
 * Two series: a legend names them, and the tooltip repeats the names.
 */
export default function MonthlyFlowChart({ months, height = 260 }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const series = [
        { key: "income", label: t("stats.income"), color: "var(--viz-1)" },
        { key: "expense", label: t("stats.expense"), color: "var(--viz-2)" },
    ];
    const data = months.map((month) => ({
        month: month.month,
        income: parseFloat(month.income),
        expense: parseFloat(month.expense),
        net: parseFloat(month.net),
    }));

    return (
        <div>
            <ul className="flex gap-4 mb-2 text-xs text-muted-foreground">
                {series.map((item) => (
                    <li key={item.key} className="flex items-center gap-1.5">
                        <span className="inline-block size-2.5 rounded-[2px]" style={{ backgroundColor: item.color }} />
                        {item.label}
                    </li>
                ))}
            </ul>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data} margin={{ top: 8, left: 0, right: 12, bottom: 0 }} barGap={2} barCategoryGap="24%">
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
                        cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const point = payload[0].payload;
                            return (
                                <ChartTooltip
                                    title={formatMonth(point.month, language, { month: "long", year: "numeric" })}
                                    rows={[
                                        ...series.map((item) => ({ label: item.label, value: formatMoney(point[item.key], language), color: item.color })),
                                        { label: t("stats.net"), value: formatMoney(point.net, language) },
                                    ]}
                                />
                            );
                        }}
                    />
                    {series.map((item) => (
                        <Bar key={item.key} dataKey={item.key} fill={item.color} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

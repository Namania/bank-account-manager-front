import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatMoney, formatMonth, toLocale } from "@/lib/format";

const compact = (value, language) =>
    new Intl.NumberFormat(toLocale(language), { notation: "compact", maximumFractionDigits: 1 }).format(value);

/** Income and expense per month, side by side on one axis, with a legend. */
export default function MonthlyFlowChart({ months, className = "h-[280px] w-full" }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const config = {
        income: { label: t("stats.income"), color: "var(--chart-2)" },
        expense: { label: t("stats.expense"), color: "var(--chart-1)" },
    };
    const data = months.map((month) => ({
        month: month.month,
        income: parseFloat(month.income),
        expense: parseFloat(month.expense),
    }));

    return (
        <ChartContainer config={config} className={`aspect-auto ${className}`}>
            <BarChart data={data} margin={{ top: 8, left: 0, right: 12, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tickFormatter={(month) => formatMonth(month, language, { month: "short", year: "2-digit" })}
                />
                <YAxis width={48} tickLine={false} axisLine={false} tickCount={4} tickFormatter={(value) => compact(value, language)} />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                    content={
                        <ChartTooltipContent
                            labelFormatter={(_, payload) => formatMonth(payload[0].payload.month, language, { month: "long", year: "numeric" })}
                            formatter={(value, name) => (
                                <div className="flex w-full items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: `var(--color-${name})` }} />
                                        {config[name]?.label}
                                    </span>
                                    <span className="font-mono font-medium tabular-nums">{formatMoney(value, language)}</span>
                                </div>
                            )}
                        />
                    }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
            </BarChart>
        </ChartContainer>
    );
}

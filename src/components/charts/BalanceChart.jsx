import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatMoney, formatMonth, toLocale } from "@/lib/format";

const compact = (value, language) =>
    new Intl.NumberFormat(toLocale(language), { notation: "compact", maximumFractionDigits: 1 }).format(value);

/**
 * End-of-month balance over time, from GET /stats/monthly/.
 * One series: the card title names it, so there is no legend.
 */
export default function BalanceChart({ months, className = "h-[220px] w-full" }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const config = { balance: { label: t("stats.balance_end"), color: "var(--chart-1)" } };
    const data = months.map((month) => ({ month: month.month, balance: parseFloat(month.balance) }));

    return (
        <ChartContainer config={config} className={`aspect-auto ${className}`}>
            <AreaChart data={data} margin={{ top: 8, left: 0, right: 12, bottom: 0 }}>
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
                    content={
                        <ChartTooltipContent
                            indicator="line"
                            labelFormatter={(_, payload) => formatMonth(payload[0].payload.month, language, { month: "long", year: "numeric" })}
                            formatter={(value) => (
                                <div className="flex w-full items-center justify-between gap-4">
                                    <span className="text-muted-foreground">{t("stats.balance_end")}</span>
                                    <span className="font-mono font-medium tabular-nums">{formatMoney(value, language)}</span>
                                </div>
                            )}
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-balance)"
                    strokeWidth={2}
                    fill="var(--color-balance)"
                    fillOpacity={0.15}
                    dot={data.length <= 12 ? { r: data.length === 1 ? 6 : 3, fill: "var(--color-balance)", fillOpacity: 1, strokeWidth: 0 } : false}
                    activeDot={{ r: 5 }}
                    animationDuration={700}
                />
            </AreaChart>
        </ChartContainer>
    );
}

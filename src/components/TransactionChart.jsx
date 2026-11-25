import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useTranslation } from "react-i18next";
import { formatDay, formatMoney } from "@/lib/format";

export const prepareChartData = (pk, balance, transactions, language) => {
    // Oldest first: by operation date, then by id for the same day.
    const sorted = [...transactions].sort((a, b) =>
        a.date === b.date ? a.id - b.id : a.date.localeCompare(b.date)
    );

    const data = [];
    let currentRunningBalance = parseFloat(balance);

    for (let i = sorted.length - 1; i >= 0; i--) {
        const t = sorted[i];

        data.unshift({
            id: t.id,
            fullDate: formatDay(t.date, language),
            date: formatDay(t.date, language, { day: '2-digit', month: 'short' }),
            balance: currentRunningBalance,
        });

        const tAmount = parseFloat(t.amount);
        const isSentByMe = pk === t.sender;

        currentRunningBalance = isSentByMe ? currentRunningBalance + tAmount : currentRunningBalance - tAmount;
    }

    return data;
};

export function TransactionChart({ pk, balance, transactions }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const chartData = useMemo(() => prepareChartData(pk, balance, transactions, language), [pk, balance, transactions, language]);
    const dateById = useMemo(() => new Map(chartData.map((point) => [point.id, point.date])), [chartData]);

    const chartConfig = {
        balance: {
            label: "Solde",
            color: "hsl(var(--primary))",
        },
        fullDate: {
            label: "Date",
            color: "hsl(var(--muted-foreground))",
        },
    };

    return (
        <Card className="w-full border-none bg-transparent shadow-none">
            <CardHeader className="px-0">
                <CardTitle>{t('account.chart.title')}</CardTitle>
                <CardDescription>{t('account.chart.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="id"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            ticks={[chartData[0]?.id, chartData[chartData.length - 1]?.id]}
                            tickFormatter={(id) => dateById.get(id) ?? ''}
                            interval="preserveStartEnd"
                            className="text-xs"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ payload }) => {
                                if (!payload || payload.length === 0) return null;
                                const data = payload[0].payload;
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                        <span className="font-bold">{t('account.chart.balance')}</span>
                                        <span className="font-bold text-right">{formatMoney(data.balance, language)}</span>
                                        <span className="text-muted-foreground">{t('transaction.table.date')}</span>
                                        <span className="font-medium text-muted-foreground text-right text-xs">{data.fullDate}</span>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#0e3b80ff"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

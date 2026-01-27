import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTranslation } from "react-i18next";

export const prepareChartData = (transactions) => {
  return transactions
    .map(t => ({
      date: new Date(t.create_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      timestamp: new Date(t.create_at).getTime(),
      amount: parseFloat(import.meta.env.VITE_BANK_ID === t.receiver ? -t.amount : t.amount)
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce((acc, curr, index) => {
      const prevBalance = index > 0 ? acc[index - 1].balance : 0;
      acc.push({
        ...curr,
        balance: prevBalance + curr.amount
      });
      return acc;
    }, []);
};

export function TransactionChart({ transactions }) {
    const { t } = useTranslation();
    const chartData = prepareChartData(transactions);

    const chartConfig = {
        balance: {
            label: "Solde",
            color: "hsl(var(--primary))",
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
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs"
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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

/**
 * Tooltip shared by the charts: a title and one row per value.
 * A colour swatch carries the series identity; the text stays in ink colours.
 */
export default function ChartTooltip({ title, rows }) {
    return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs min-w-36">
            <p className="font-medium mb-1">{title}</p>
            {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        {row.color && <span className="inline-block size-2 rounded-[2px]" style={{ backgroundColor: row.color }} />}
                        {row.label}
                    </span>
                    <span className="font-semibold tabular-nums">{row.value}</span>
                </div>
            ))}
        </div>
    );
}

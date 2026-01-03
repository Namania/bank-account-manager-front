import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function TransactionList({ transactions }) {
    const { t } = useTranslation();
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t('transaction.table.id')}</TableHead>
                        <TableHead>{t('transaction.table.sender')}</TableHead>
                        <TableHead>{t('transaction.table.receiver')}</TableHead>
                        <TableHead>{t('transaction.table.category')}</TableHead>
                        <TableHead>{t('transaction.table.amount')}</TableHead>
                        <TableHead>{t('transaction.table.date')}</TableHead>
                        <TableHead>{t('transaction.table.description')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                #{tx.id}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`font-medium ${tx.sender.label === 'Bank' ? 'text-neutral-600' : ''}`}
                                >
                                    {tx.sender.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`font-medium ${tx.receiver.label === 'Bank' ? 'text-neutral-600' : ''}`}
                                >
                                    {tx.receiver.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {tx.category ? (
                                    <Badge
                                        variant="outline"
                                        className="font-medium"
                                        style={{
                                            borderColor: tx.category.color,
                                            color: tx.category.color,
                                            backgroundColor: `${tx.category.color}10`
                                        }}
                                    >
                                        {tx.category.label}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">Sans catégorie</span>
                                )}
                            </TableCell>
                            <TableCell className={`font-bold text-sm ${tx.sender.label === 'Bank' ? 'text-green-600' : tx.receiver.label === 'Bank' ? 'text-red-500' : ''}`}>
                                {tx.receiver.label === 'Bank' ? '-' : ''}{parseFloat(tx.amount).toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                })}
                            </TableCell>
                            <TableCell className="text-sm">
                                {new Date(tx.create_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm">
                                {tx.comment || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

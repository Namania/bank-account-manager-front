import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteTransaction } from "@/api/transaction";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Edit, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

export default function TransactionList({ transactions, setTransactions, updateAccount = null }) {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const confirmDelete = async () => {
        if (!current) return;
        try {
            await deleteTransaction(current.id);
            const tmp = transactions.filter((tx) => tx.id !== current.id);
            setTransactions({
                results: tmp,
                count: tmp.length
            });
            if (updateAccount) {
                updateAccount();
            }
        } catch (error) {
            console.error(error);
            toast.error(t('core.fetch_error'));
        } finally {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('account.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('account.delete.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('core.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                            {t('core.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
                        <TableHead></TableHead>
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
                                    className={`font-medium ${tx.sender_details.label === 'Bank' ? 'text-neutral-600' : ''}`}
                                >
                                    {tx.sender_details.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`font-medium ${tx.receiver_details.label === 'Bank' ? 'text-neutral-600' : ''}`}
                                >
                                    {tx.receiver_details.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {tx.category ? (
                                    <Badge
                                        variant="outline"
                                        className="font-medium"
                                        style={{
                                            borderColor: tx.category_details.color,
                                            color: tx.category_details.color,
                                            backgroundColor: `${tx.category_details.color}10`
                                        }}
                                    >
                                        {tx.category_details.label}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">Sans catégorie</span>
                                )}
                            </TableCell>
                            <TableCell className={`font-bold text-sm ${tx.sender_details.label === 'Bank' ? 'text-green-600' : tx.receiver_details.label === 'Bank' ? 'text-red-500' : ''}`}>
                                {tx.receiver_details.label === 'Bank' ? '-' : ''}{parseFloat(tx.amount).toLocaleString('fr-FR', {
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
                            <TableCell className="text-end">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <MoreHorizontalIcon className="hover:text-neutral-500" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-40" align="end">
                                        <DropdownMenuItem onSelect={() => setShowTransactionDialog(true)} disabled>
                                            <Edit /> {t('transaction.actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {
                                            setCurrent(tx);
                                            setIsModalOpen(true);
                                        }} className="text-red-800">
                                            <Trash2Icon className="text-red-500" /> {t('transaction.actions.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

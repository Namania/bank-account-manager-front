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
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Edit, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import TransactionDialog from "./TransactionDialog";
import { formatDay, formatMoney } from "@/lib/format";

// A transaction is read-only once one of its accounts is deactivated. The API
// also refuses (403) when an account belongs to someone else, which only it knows.
const isLocked = (tx) => [tx.sender_details, tx.receiver_details].some(
    (account) => account && !account.is_bank && !account.is_active
);

// One side of a transaction. The account may have been removed (null) or deactivated.
function AccountBadge({ account }) {
    const { t } = useTranslation();

    if (!account) {
        return <span className="text-muted-foreground text-xs italic">{t('transaction.deleted_account')}</span>;
    }
    const inactive = !account.is_bank && !account.is_active;
    return (
        <Badge
            variant="outline"
            title={inactive ? t('transaction.inactive_account') : undefined}
            className={`font-medium ${account.is_bank ? 'text-neutral-600' : ''} ${inactive ? 'line-through text-muted-foreground' : ''}`}
        >
            {account.is_bank ? t('transaction.bank') : account.label}
        </Badge>
    );
}

export default function TransactionList({ transactions, setTransactions, updateAccount = null, accounts = [], bank = null, categories = [] }) {
    const { t, i18n } = useTranslation();
    const [current, setCurrent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const confirmDelete = async () => {
        if (!current) return;
        try {
            await deleteTransaction(current.id);
            const deletedId = current.id;
            setTransactions((prev) => ({
                ...prev,
                results: prev.results.filter((tx) => tx.id !== deletedId),
                count: Math.max(0, prev.count - 1)
            }));
            if (updateAccount) {
                updateAccount();
            }
        } catch (error) {
            // 403: one of the two accounts is not ours or has been deactivated.
            toast.error(t(error.response?.status === 403 ? 'transaction.locked' : 'core.fetch_error'));
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleUpdated = (updated) => {
        setTransactions((prev) => ({
            ...prev,
            results: prev.results.map((tx) => (tx.id === updated.id ? updated : tx))
        }));
        if (updateAccount) {
            updateAccount();
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('transaction.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('transaction.delete.desc')}
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
            {current && (
                <TransactionDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    mode="edit"
                    transaction={current}
                    accounts={accounts}
                    bank={bank}
                    categories={categories}
                    onSaved={handleUpdated}
                />
            )}
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
                    {transactions.map((tx) => {
                        const fromBank = Boolean(tx.sender_details?.is_bank);
                        const toBank = Boolean(tx.receiver_details?.is_bank);
                        const locked = isLocked(tx);

                        return (
                            <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{tx.id}
                                </TableCell>
                                <TableCell>
                                    <AccountBadge account={tx.sender_details} />
                                </TableCell>
                                <TableCell>
                                    <AccountBadge account={tx.receiver_details} />
                                </TableCell>
                                <TableCell>
                                    {tx.category_details ? (
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
                                        <span className="text-muted-foreground text-xs italic">{t('transaction.no_category')}</span>
                                    )}
                                </TableCell>
                                <TableCell className={`font-bold text-sm ${fromBank ? 'text-green-600' : toBank ? 'text-red-500' : ''}`}>
                                    {toBank ? '-' : ''}{formatMoney(tx.amount, i18n.language)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDay(tx.date, i18n.language)}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm">
                                    {tx.is_opening
                                        ? <Badge variant="secondary">{t('transaction.opening')}</Badge>
                                        : tx.comment || "-"}
                                </TableCell>
                                <TableCell className="text-end">
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t('core.actions')}>
                                                <MoreHorizontalIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-40" align="end">
                                            <DropdownMenuItem onSelect={() => {
                                                setCurrent(tx);
                                                setIsEditOpen(true);
                                            }} disabled={locked}>
                                                <Edit /> {t('transaction.actions.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => {
                                                setCurrent(tx);
                                                setIsModalOpen(true);
                                            }} className="text-red-800" disabled={locked}>
                                                <Trash2Icon className="text-red-500" /> {t('transaction.actions.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

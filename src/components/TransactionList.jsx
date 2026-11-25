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
import { ArrowDownLeftIcon, ArrowLeftRightIcon, ArrowRightIcon, ArrowUpRightIcon, Edit, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import TransactionDialog from "./TransactionDialog";
import ConfirmDialog from "./ConfirmDialog";
import { formatDay, formatMoney } from "@/lib/format";

// A transaction is read-only once one of its accounts is deactivated. The API
// also refuses (403) when an account belongs to someone else, which only it knows.
const isLocked = (tx) => [tx.sender_details, tx.receiver_details].some(
    (account) => account && !account.is_bank && !account.is_active
);

// Where the money goes: in from the bank, out to the bank, or between accounts.
const directionOf = (tx) => {
    if (tx.sender_details?.is_bank) return { sign: '+', chip: 'bg-chart-2/15 text-chart-2', Icon: ArrowDownLeftIcon };
    if (tx.receiver_details?.is_bank) return { sign: '−', chip: 'bg-chart-1/15 text-chart-1', Icon: ArrowUpRightIcon };
    return { sign: '', chip: 'bg-chart-3/15 text-chart-3', Icon: ArrowLeftRightIcon };
};

function DirectionChip({ tx, className = "size-8" }) {
    const { chip, Icon } = directionOf(tx);
    return (
        <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-lg ${chip} ${className}`}>
            <Icon className="size-4" />
        </span>
    );
}

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
            className={`font-medium max-w-full ${account.is_bank ? 'text-muted-foreground' : ''} ${inactive ? 'line-through text-muted-foreground' : ''}`}
        >
            <span className="truncate">{account.is_bank ? t('transaction.bank') : account.label}</span>
        </Badge>
    );
}

function CategoryBadge({ category }) {
    const { t } = useTranslation();

    if (!category) {
        return <span className="text-muted-foreground text-xs italic">{t('transaction.no_category')}</span>;
    }
    return (
        <Badge
            variant="outline"
            className="font-medium"
            style={{ borderColor: category.color, color: category.color, backgroundColor: `${category.color}10` }}
        >
            {category.label}
        </Badge>
    );
}

function RowMenu({ locked, onEdit, onDelete }) {
    const { t } = useTranslation();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label={t('core.actions')}>
                    <MoreHorizontalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onSelect={onEdit} disabled={locked}>
                    <Edit /> {t('transaction.actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDelete} className="text-destructive" disabled={locked}>
                    <Trash2Icon className="text-destructive" /> {t('transaction.actions.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Transactions as a table on wide screens and as a list of cards on a phone,
 * where a seven-column table cannot fit.
 */
export default function TransactionList({ transactions, setTransactions, updateAccount = null, accounts = [], bank = null, categories = [] }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;
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

    const edit = (tx) => () => { setCurrent(tx); setIsEditOpen(true); };
    const remove = (tx) => () => { setCurrent(tx); setIsModalOpen(true); };
    const amountOf = (tx) => `${directionOf(tx).sign}${formatMoney(tx.amount, language)}`;
    const noteOf = (tx) => (tx.is_opening ? t('transaction.opening') : tx.comment);

    return (
        <>
            <ConfirmDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                title={t('transaction.delete.title')}
                description={t('transaction.delete.desc')}
                onConfirm={confirmDelete}
            />
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

            {/* Phone: one card per transaction. */}
            <ul className="md:hidden space-y-2">
                {transactions.map((tx) => (
                    <li key={tx.id} className="rounded-xl border bg-card p-3">
                        <div className="flex items-start gap-3">
                            <DirectionChip tx={tx} className="size-10" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="truncate text-sm font-medium">{noteOf(tx) || t('transaction.untitled')}</span>
                                    <span className="shrink-0 text-sm font-bold tabular-nums">{amountOf(tx)}</span>
                                </div>
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <AccountBadge account={tx.sender_details} />
                                    <ArrowRightIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                                    <AccountBadge account={tx.receiver_details} />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    <span>{formatDay(tx.date, language)}</span>
                                    <CategoryBadge category={tx.category_details} />
                                </div>
                            </div>
                            <RowMenu locked={isLocked(tx)} onEdit={edit(tx)} onDelete={remove(tx)} />
                        </div>
                    </li>
                ))}
            </ul>

            {/* Wider screens: the full table. */}
            <div className="hidden md:block rounded-md border bg-card">
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
                                <TableCell>
                                    <span className="flex items-center gap-2">
                                        <DirectionChip tx={tx} />
                                        <span className="font-mono text-xs text-muted-foreground">#{tx.id}</span>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <AccountBadge account={tx.sender_details} />
                                </TableCell>
                                <TableCell>
                                    <AccountBadge account={tx.receiver_details} />
                                </TableCell>
                                <TableCell>
                                    <CategoryBadge category={tx.category_details} />
                                </TableCell>
                                <TableCell className="font-bold text-sm tabular-nums">
                                    {amountOf(tx)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDay(tx.date, language)}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm">
                                    {tx.is_opening
                                        ? <Badge variant="secondary">{t('transaction.opening')}</Badge>
                                        : tx.comment || "-"}
                                </TableCell>
                                <TableCell className="text-end">
                                    <RowMenu locked={isLocked(tx)} onEdit={edit(tx)} onDelete={remove(tx)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

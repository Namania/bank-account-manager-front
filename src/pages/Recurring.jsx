import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightIcon, Edit, MoreHorizontalIcon, PauseIcon, PlayIcon, PlusIcon, RepeatIcon, Trash2Icon } from "lucide-react";
import { getAccounts, getBankAccount } from "@/api/account";
import { getCategories } from "@/api/category";
import { createRecurringTransaction, deleteRecurringTransaction, getRecurringTransactions, updateRecurringTransaction } from "@/api/recurring";
import ConfirmDialog from "@/components/ConfirmDialog";
import FadeAnimation from "@/components/animation/FadeAnimation";
import { formatDay, formatMoney, toEuros, today } from "@/lib/format";

const NO_CATEGORY = "none";
const FREQUENCIES = ["weekly", "monthly", "yearly"];
const asId = (value) => (value == null ? "" : String(value));

function RecurringForm({ rule, accounts, bank, categories, onSaved, onOpenChange }) {
    const { t } = useTranslation();
    const isEdit = rule !== null;

    const [sender, setSender] = useState(asId(rule?.sender));
    const [receiver, setReceiver] = useState(asId(rule?.receiver));
    const [amount, setAmount] = useState(rule?.amount ?? "");
    const [category, setCategory] = useState(rule?.category != null ? asId(rule.category) : NO_CATEGORY);
    const [comment, setComment] = useState(rule?.comment ?? "");
    const [frequency, setFrequency] = useState(rule?.frequency ?? "monthly");
    const [startDate, setStartDate] = useState(rule?.start_date ?? today());
    const [endDate, setEndDate] = useState(rule?.end_date ?? "");
    const [saving, setSaving] = useState(false);

    const sides = [
        ...(bank ? [{ id: bank.id, label: t("transaction.bank") }] : []),
        ...accounts.map((account) => ({ id: account.id, label: account.label })),
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();

        const euros = toEuros(amount);
        if (!euros) return toast.error(t("account.transactions.invalid_amount"));
        if (!sender || !receiver) return toast.error(t("transaction.invalid"));
        if (sender === receiver) return toast.error(t("transaction.same_account"));

        const payload = {
            sender: Number(sender),
            receiver: Number(receiver),
            amount: euros,
            category: category === NO_CATEGORY ? null : Number(category),
            comment,
            end_date: endDate || null,
            // The schedule is fixed once the rule exists.
            ...(isEdit ? {} : { frequency, start_date: startDate }),
        };

        setSaving(true);
        try {
            onSaved(isEdit ? await updateRecurringTransaction(rule.id, payload) : await createRecurringTransaction(payload));
            onOpenChange(false);
            toast.success(t(isEdit ? "recurring.updated" : "recurring.created"));
        } catch (error) {
            const status = error.response?.status;
            toast.error(t(status === 403 ? "transaction.locked" : status === 400 ? "recurring.invalid" : "core.fetch_error"));
        } finally {
            setSaving(false);
        }
    };

    const accountSelect = (value, onChange, placeholder) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
            <SelectContent>
                {sides.map((side) => (
                    <SelectItem key={side.id} value={String(side.id)}>{side.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup className="py-3">
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel>{t("transaction.table.sender")}</FieldLabel>
                        {accountSelect(sender, setSender, t("transaction.fields.sender_placeholder"))}
                    </Field>
                    <Field>
                        <FieldLabel>{t("transaction.table.receiver")}</FieldLabel>
                        {accountSelect(receiver, setReceiver, t("account.transactions.fields.receiver_placeholder"))}
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel htmlFor="recurring-amount">{t("account.transactions.fields.amount")}</FieldLabel>
                        <Input id="recurring-amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required />
                    </Field>
                    <Field>
                        <FieldLabel>{t("account.transactions.fields.category")}</FieldLabel>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_CATEGORY}>{t("transaction.no_category")}</SelectItem>
                                {categories.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel>{t("recurring.frequency")}</FieldLabel>
                        <Select value={frequency} onValueChange={setFrequency} disabled={isEdit}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {FREQUENCIES.map((item) => (
                                    <SelectItem key={item} value={item}>{t(`recurring.frequencies.${item}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="recurring-start">{t("recurring.start_date")}</FieldLabel>
                        <Input id="recurring-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} disabled={isEdit} required />
                    </Field>
                </div>
                <Field>
                    <FieldLabel htmlFor="recurring-end">{t("recurring.end_date")}</FieldLabel>
                    <Input id="recurring-end" type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="recurring-comment">{t("account.transactions.fields.description")}</FieldLabel>
                    <Textarea id="recurring-comment" value={comment} maxLength={200} onChange={(event) => setComment(event.target.value)} />
                </Field>
            </FieldGroup>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{t("core.cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>{t(isEdit ? "core.save" : "core.create")}</Button>
            </DialogFooter>
        </form>
    );
}

export default function Recurring() {
    const { t, i18n } = useTranslation();
    const language = i18n.language;
    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const [rules, setRules] = useState([]);
    const [references, setReferences] = useState({ accounts: [], bank: null, categories: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [list, accounts, bank, categories] = await Promise.all([
                    getRecurringTransactions(), getAccounts(), getBankAccount(), getCategories(),
                ]);
                setRules(list);
                setReferences({ accounts, bank, categories });
            } catch {
                toast.error(t("core.fetch_error"));
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [t]);

    const closeDialog = (open) => {
        if (open) return;
        setIsModalOpen(false);
        setEditing(null);
    };

    const handleSaved = (saved) => {
        setRules((current) => current.some((rule) => rule.id === saved.id)
            ? current.map((rule) => (rule.id === saved.id ? saved : rule))
            : [...current, saved]);
    };

    const togglePause = async (rule) => {
        try {
            handleSaved(await updateRecurringTransaction(rule.id, { is_active: !rule.is_active }));
        } catch (error) {
            toast.error(t(error.response?.status === 403 ? "transaction.locked" : "core.fetch_error"));
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteRecurringTransaction(toDelete.id);
            setRules((current) => current.filter((rule) => rule.id !== toDelete.id));
        } catch {
            toast.error(t("core.fetch_error"));
        } finally {
            setToDelete(null);
        }
    };

    const sideLabel = (account) => {
        if (!account) return t("transaction.deleted_account");
        return account.is_bank ? t("transaction.bank") : account.label;
    };

    if (isLoading) return null;

    return (
        <div className="p-6 space-y-6">
            <Dialog open={isModalOpen || editing !== null} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>{t(editing ? "recurring.edit" : "recurring.new")}</DialogTitle>
                        <DialogDescription>{t("recurring.desc")}</DialogDescription>
                    </DialogHeader>
                    <RecurringForm rule={editing} {...references} onSaved={handleSaved} onOpenChange={closeDialog} />
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => { if (!open) setToDelete(null); }}
                title={t("recurring.delete.title")}
                description={t("recurring.delete.desc")}
                onConfirm={confirmDelete}
            />

            {rules.length === 0 ? (
                <FadeAnimation delay={.3} className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-xl">
                    <RepeatIcon className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">{t("recurring.empty")}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" /> {t("recurring.new")}
                    </Button>
                </FadeAnimation>
            ) : (
                <FadeAnimation delay={.3}>
                    <Card className="py-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("recurring.movement")}</TableHead>
                                    <TableHead>{t("transaction.table.category")}</TableHead>
                                    <TableHead>{t("transaction.table.amount")}</TableHead>
                                    <TableHead>{t("recurring.frequency")}</TableHead>
                                    <TableHead>{t("recurring.next_date")}</TableHead>
                                    <TableHead>{t("recurring.occurrences")}</TableHead>
                                    <TableHead>{t("recurring.status")}</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell>
                                            <span className="flex items-center gap-2 text-sm">
                                                <Badge variant="outline">{sideLabel(rule.sender_details)}</Badge>
                                                <ArrowRightIcon className="size-3 text-muted-foreground" />
                                                <Badge variant="outline">{sideLabel(rule.receiver_details)}</Badge>
                                            </span>
                                            {rule.comment && <p className="text-xs text-muted-foreground mt-1 max-w-[260px] truncate">{rule.comment}</p>}
                                        </TableCell>
                                        <TableCell>
                                            {rule.category_details ? (
                                                <Badge variant="outline" style={{ borderColor: rule.category_details.color, color: rule.category_details.color }}>
                                                    {rule.category_details.label}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">{t("transaction.no_category")}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-sm tabular-nums">{formatMoney(rule.amount, language)}</TableCell>
                                        <TableCell className="text-sm">{t(`recurring.frequencies.${rule.frequency}`)}</TableCell>
                                        <TableCell className="text-sm">{rule.next_date ? formatDay(rule.next_date, language) : "-"}</TableCell>
                                        <TableCell className="text-sm tabular-nums">{rule.occurrences}</TableCell>
                                        <TableCell>
                                            <Badge variant={rule.is_active ? "secondary" : "outline"}>
                                                {t(rule.is_active ? "recurring.active" : "recurring.paused")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("core.actions")}>
                                                        <MoreHorizontalIcon />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-44" align="end">
                                                    <DropdownMenuItem onSelect={() => setEditing(rule)}>
                                                        <Edit /> {t("transaction.actions.edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => togglePause(rule)}>
                                                        {rule.is_active ? <PauseIcon /> : <PlayIcon />}
                                                        {t(rule.is_active ? "recurring.pause" : "recurring.resume")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setToDelete(rule)} className="text-red-800">
                                                        <Trash2Icon className="text-red-500" /> {t("transaction.actions.delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </FadeAnimation>
            )}
        </div>
    );
}

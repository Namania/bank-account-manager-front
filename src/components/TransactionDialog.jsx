import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTransaction, updateTransaction } from "@/api/transaction";
import { toEuros, today } from "@/lib/format";

const NO_CATEGORY = "none";
const COMMENT_MAX = 200;

const TITLES = {
    credit: "account.transactions.credit",
    debit: "account.transactions.debit",
    transfer: "account.transactions.over_account",
    edit: "transaction.edit.title",
};

const asId = (value) => (value == null ? "" : String(value));

// Who sends and who receives, depending on what the dialog is opened for.
const initialSides = ({ mode, account, bank, transaction }) => {
    if (mode === "edit") return { sender: asId(transaction.sender), receiver: asId(transaction.receiver) };
    if (mode === "credit") return { sender: asId(bank?.id), receiver: asId(account.id) };
    if (mode === "debit") return { sender: asId(account.id), receiver: asId(bank?.id) };
    return { sender: asId(account.id), receiver: "" };
};

/**
 * One dialog for the four ways to write a transaction:
 * credit and debit (against the bank), transfer (to another account) and edit.
 */
export default function TransactionDialog({ open, onOpenChange, mode, ...props }) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t(TITLES[mode] ?? TITLES.transfer)}</DialogTitle>
                    <DialogDescription>
                        {t(mode === "edit" ? "transaction.edit.desc" : "account.transactions.desc")}
                    </DialogDescription>
                </DialogHeader>
                {/* Mounted only while open: the form starts from fresh values each time. */}
                <TransactionForm mode={mode} onOpenChange={onOpenChange} {...props} />
            </DialogContent>
        </Dialog>
    );
}

function TransactionForm({ mode, account = null, accounts = [], bank = null, categories = [], transaction = null, onSaved, onOpenChange }) {
    const { t } = useTranslation();
    const isEdit = mode === "edit";
    const sides = initialSides({ mode, account, bank, transaction });

    const [sender, setSender] = useState(sides.sender);
    const [receiver, setReceiver] = useState(sides.receiver);
    const [amount, setAmount] = useState(isEdit ? transaction.amount : "");
    const [category, setCategory] = useState(isEdit && transaction.category != null ? asId(transaction.category) : NO_CATEGORY);
    const [date, setDate] = useState(isEdit ? transaction.date : today());
    const [comment, setComment] = useState(isEdit ? transaction.comment ?? "" : "");
    const [saving, setSaving] = useState(false);

    // Either side may be one of the user's accounts or the bank.
    const sideOptions = [
        ...(bank ? [{ id: bank.id, label: t("transaction.bank") }] : []),
        ...accounts.map((item) => ({ id: item.id, label: item.label })),
    ];
    const receiverOptions = isEdit ? sideOptions : accounts.filter((item) => item.id !== account?.id);

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
            date,
        };

        setSaving(true);
        try {
            const saved = isEdit
                ? await updateTransaction(transaction.id, payload)
                : await createTransaction(payload);
            onSaved(saved);
            onOpenChange(false);
            toast.success(t(isEdit ? "transaction.updated" : "transaction.created"));
        } catch (error) {
            const status = error.response?.status;
            // 403: one of the two accounts is not ours or has been deactivated.
            toast.error(t(status === 403 ? "transaction.locked" : status === 400 ? "transaction.invalid" : "core.fetch_error"));
        } finally {
            setSaving(false);
        }
    };

    const accountSelect = (value, onChange, options, placeholder) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>{option.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup className="py-3">
                {isEdit && (
                    <Field>
                        <FieldLabel>{t("transaction.table.sender")}</FieldLabel>
                        {accountSelect(sender, setSender, sideOptions, t("transaction.fields.sender_placeholder"))}
                    </Field>
                )}
                {(isEdit || mode === "transfer") && (
                    <Field>
                        <FieldLabel>{t("account.transactions.fields.receiver")}</FieldLabel>
                        {accountSelect(receiver, setReceiver, receiverOptions, t("account.transactions.fields.receiver_placeholder"))}
                    </Field>
                )}
                <Field>
                    <FieldLabel htmlFor="transaction-amount">{t("account.transactions.fields.amount")}</FieldLabel>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-muted-foreground sm:text-sm">€</span>
                        </div>
                        <Input
                            id="transaction-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            className="pl-7"
                            onKeyDown={(event) => ["e", "E", "+", "-"].includes(event.key) && event.preventDefault()}
                            required
                        />
                    </div>
                </Field>
                <Field>
                    <FieldLabel>{t("account.transactions.fields.category")}</FieldLabel>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_CATEGORY}>{t("transaction.no_category")}</SelectItem>
                            {categories.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="transaction-date">{t("transaction.table.date")}</FieldLabel>
                    <Input
                        id="transaction-date"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="transaction-comment">{t("account.transactions.fields.description")}</FieldLabel>
                    <Textarea
                        id="transaction-comment"
                        value={comment}
                        maxLength={COMMENT_MAX}
                        placeholder={t("account.transactions.fields.description_placeholder")}
                        onChange={(event) => setComment(event.target.value)}
                    />
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

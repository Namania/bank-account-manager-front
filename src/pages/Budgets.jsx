import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangleIcon, Edit, MoreVertical, PlusIcon, TargetIcon, Trash2Icon } from "lucide-react";
import { getCategories } from "@/api/category";
import { createBudget, deleteBudget, getBudgets, updateBudget } from "@/api/budget";
import ConfirmDialog from "@/components/ConfirmDialog";
import FadeAnimation from "@/components/animation/FadeAnimation";
import { formatMoney, formatMonth, toEuros, today } from "@/lib/format";

function BudgetForm({ budget, categories, taken, onSaved, onOpenChange }) {
    const { t } = useTranslation();
    const isEdit = budget !== null;
    // One budget per category: only offer the ones that have none yet.
    const available = categories.filter((category) => !taken.has(category.id));

    const [category, setCategory] = useState(isEdit ? String(budget.category) : "");
    const [amount, setAmount] = useState(budget?.amount ?? "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const euros = toEuros(amount);
        if (!euros) return toast.error(t("account.transactions.invalid_amount"));
        if (!category) return toast.error(t("budget.errors.category"));

        setSaving(true);
        try {
            await (isEdit ? updateBudget(budget.id, { amount: euros }) : createBudget({ category: Number(category), amount: euros }));
            onSaved();
            onOpenChange(false);
            toast.success(t(isEdit ? "budget.updated" : "budget.created"));
        } catch (error) {
            // 400: a budget already exists for this category.
            toast.error(t(error.response?.status === 400 ? "budget.errors.exists" : "core.fetch_error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>{t("transaction.table.category")}</Label>
                {isEdit ? (
                    <p className="text-sm font-medium">{budget.category_details?.label}</p>
                ) : (
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("account.transactions.fields.category_placeholder")} /></SelectTrigger>
                        <SelectContent>
                            {available.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="budget-amount">{t("budget.amount")}</Label>
                <Input id="budget-amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{t("core.cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>{t(isEdit ? "core.save" : "core.create")}</Button>
            </DialogFooter>
        </form>
    );
}

// Spent against the monthly amount. Going over is said in words and with an
// icon, not by colour alone.
function BudgetCard({ budget, onEdit, onDelete }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    const amount = parseFloat(budget.amount);
    const spent = parseFloat(budget.spent);
    const remaining = parseFloat(budget.remaining);
    const over = remaining < 0;
    const share = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base min-w-0">
                    <span className="inline-block size-2.5 shrink-0 rounded-full border" style={{ backgroundColor: budget.category_details?.color ?? "transparent" }} />
                    <span className="truncate">{budget.category_details?.label}</span>
                </CardTitle>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("core.actions")}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onEdit}>
                            <Edit /> {t("transaction.actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onDelete} className="text-destructive">
                            <Trash2Icon className="text-destructive" /> {t("transaction.actions.delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-black tabular-nums">{formatMoney(spent, language)}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{t("budget.of", { amount: formatMoney(amount, language) })}</span>
                </div>
                <div
                    className="h-2 rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(share)}
                    aria-label={t("budget.spent")}
                >
                    <div className={`h-2 rounded-full ${over ? "bg-destructive" : ""}`} style={{ width: `${share}%`, backgroundColor: over ? undefined : "var(--viz-1)" }} />
                </div>
                {over ? (
                    <Badge variant="destructive" className="gap-1">
                        <AlertTriangleIcon className="size-3" />
                        {t("budget.over", { amount: formatMoney(-remaining, language) })}
                    </Badge>
                ) : (
                    <p className="text-sm text-muted-foreground">{t("budget.remaining", { amount: formatMoney(remaining, language) })}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Budgets() {
    const { t, i18n } = useTranslation();
    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const [month, setMonth] = useState(today().slice(0, 7));
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        getCategories().then(setCategories).catch(() => toast.error(t("core.fetch_error")));
    }, [t]);

    // Spent and remaining are computed by the API for the chosen month.
    useEffect(() => {
        let ignore = false;
        getBudgets(month)
            .then((list) => { if (!ignore) setBudgets(list); })
            .catch(() => { if (!ignore) toast.error(t("core.fetch_error")); })
            .finally(() => { if (!ignore) setIsLoading(false); });
        return () => { ignore = true; };
    }, [month, version, t]);

    const reload = () => setVersion((current) => current + 1);

    const closeDialog = (open) => {
        if (open) return;
        setIsModalOpen(false);
        setEditing(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteBudget(toDelete.id);
            reload();
        } catch {
            toast.error(t("core.fetch_error"));
        } finally {
            setToDelete(null);
        }
    };

    if (isLoading) return null;

    const taken = new Set(budgets.map((budget) => budget.category));

    return (
        <div className="p-6 space-y-6">
            <Dialog open={isModalOpen || editing !== null} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t(editing ? "budget.edit" : "budget.new")}</DialogTitle>
                        <DialogDescription>{t("budget.desc")}</DialogDescription>
                    </DialogHeader>
                    <BudgetForm budget={editing} categories={categories} taken={taken} onSaved={reload} onOpenChange={closeDialog} />
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => { if (!open) setToDelete(null); }}
                title={t("budget.delete.title")}
                description={t("budget.delete.desc")}
                onConfirm={confirmDelete}
            />

            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <Label htmlFor="budget-month">{t("stats.table.month")}</Label>
                    <Input id="budget-month" type="month" value={month} onChange={(event) => event.target.value && setMonth(event.target.value)} />
                </div>
                <p className="text-sm text-muted-foreground pb-2">{formatMonth(month, i18n.language, { month: "long", year: "numeric" })}</p>
            </div>

            {budgets.length === 0 ? (
                <FadeAnimation delay={.3} className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-xl">
                    <TargetIcon className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">{t("budget.empty")}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" /> {t("budget.new")}
                    </Button>
                </FadeAnimation>
            ) : (
                <FadeAnimation delay={.3} className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    {budgets.map((budget) => (
                        <BudgetCard key={budget.id} budget={budget} onEdit={() => setEditing(budget)} onDelete={() => setToDelete(budget)} />
                    ))}
                </FadeAnimation>
            )}
        </div>
    );
}

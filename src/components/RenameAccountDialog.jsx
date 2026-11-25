import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount } from "@/api/account";

export default function RenameAccountDialog({ open, onOpenChange, account, onRenamed }) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("account.rename.title")}</DialogTitle>
                    <DialogDescription>{t("account.rename.desc")}</DialogDescription>
                </DialogHeader>
                {/* Mounted only while open: the field starts from the current name each time. */}
                <RenameForm account={account} onRenamed={onRenamed} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}

function RenameForm({ account, onRenamed, onOpenChange }) {
    const { t } = useTranslation();
    const [label, setLabel] = useState(account.label);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            onRenamed(await updateAccount(account.id, { label: label.trim() }));
            onOpenChange(false);
            toast.success(t("account.rename.success"));
        } catch {
            toast.error(t("core.fetch_error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="account-label">{t("account.fields.label")}</Label>
                <Input
                    id="account-label"
                    value={label}
                    maxLength={200}
                    onChange={(event) => setLabel(event.target.value)}
                    required
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{t("core.cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={saving || !label.trim()}>{t("core.save")}</Button>
            </DialogFooter>
        </form>
    );
}

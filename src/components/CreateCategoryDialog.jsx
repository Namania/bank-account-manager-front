import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createCategory } from "@/api/category";

export function CreateCategoryDialog({ open, onOpenChange, onCreated }) {
    const { t } = useTranslation();
    const [label, setLabel] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [loading, setLoading] = useState(false);

    const close = (open) => {
        if (!open) {
            onOpenChange(false);
            setLabel("");
            setColor("#ffffff");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const created = await createCategory({ label, color });
            onCreated(created);
            close(false);
            setLabel("");
        } catch {
            toast.error(t('core.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ t('category.dialog.title') }</DialogTitle>
                    <DialogDescription>
                        { t('category.dialog.description') }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{ t('category.fields.label') }</Label>
                        <Input value={label} maxLength={200} onChange={(e) => setLabel(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>{ t('category.fields.color') }</Label>
                        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? "..." : t('category.fields.send')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

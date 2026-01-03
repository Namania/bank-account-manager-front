import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateCategory } from "@/api/category";

export function EditCategoryDialog({ open, onOpenChange, category, onUpdated }) {
    const { t } = useTranslation();
    const [label, setLabel] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setLabel(category.label);
            setColor(category.color);
        }
    }, [category, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedData = await updateCategory(category.id, { label, color });
            onUpdated(updatedData);
            onOpenChange(false);
            toast.success(t('category.edit.actions.success'));
        } catch (error) {
            console.error("Erreur modification:", error);
            toast.error(t('category.edit.actions.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('category.edit.title')}</DialogTitle>
                    <DialogDescription>
                        {t('category.edit.description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('category.fields.label')}</Label>
                        <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('category.fields.color')}</Label>
                        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1 cursor-pointer" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "..." : t('category.fields.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

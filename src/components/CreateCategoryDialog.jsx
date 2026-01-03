import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useTranslation } from "react-i18next";

export function CreateCategoryDialog({ open, onOpenChange, onCreated }) {
    const { t } = useTranslation();
    const [label, setLabel] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API_URL}/categories/`, { label, color });
            onCreated(response.data);
            onOpenChange(false);
            setLabel("");
        } catch (error) {
            console.error("Erreur creation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
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

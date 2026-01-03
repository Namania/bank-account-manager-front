import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createAccount } from "@/api/account";
import { useAuth } from "@/auth/AuthContext";

export function CreateAccountDialog({ open, onOpenChange, onCreated }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [label, setLabel] = useState("");
    const [balance, setBalance] = useState("0.00");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const owners = [
                user.id
            ];
            const response = await createAccount({
                owners,
                label, 
                balance: parseFloat(balance),
            });
            onCreated(response);
            onOpenChange(false);

            setLabel("");
            setBalance("0.00");

            toast.success(t('account.created'));
        } catch (error) {
            console.log(error);
            toast.error(t('core.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('account.dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('account.dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">{t('account.fields.label')}</Label>
                        <Input 
                            id="label"
                            placeholder={t('account.fields.label_placeholder')}
                            value={label} 
                            onChange={(e) => setLabel(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance">{t('account.fields.balance')}</Label>
                        <Input 
                            id="balance"
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            value={balance} 
                            onChange={(e) => setBalance(e.target.value)} 
                            required 
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? "..." : t('account.fields.send')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

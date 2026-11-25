import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserMinusIcon, UserPlusIcon } from "lucide-react";
import { shareAccount, unshareAccount } from "@/api/account";
import { useAuth } from "@/auth/AuthContext";

const SHARE_ERRORS = { 400: "account.share.errors.already", 404: "account.share.errors.unknown", 429: "core.login.errors.throttled" };

/**
 * Co-owners of an account: add one by username, remove one, or leave.
 * `onChanged` receives the updated account; `onLeft` runs when the user removes themself.
 */
export default function ShareAccountDialog({ open, onOpenChange, account, onChanged, onLeft }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [username, setUsername] = useState("");
    const [busy, setBusy] = useState(false);

    const owners = account.owners_details ?? [];

    const handleAdd = async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
            onChanged(await shareAccount(account.id, username.trim()));
            setUsername("");
            toast.success(t("account.share.added"));
        } catch (error) {
            toast.error(t(SHARE_ERRORS[error.response?.status] ?? "core.fetch_error"));
        } finally {
            setBusy(false);
        }
    };

    const handleRemove = async (owner) => {
        setBusy(true);
        try {
            await unshareAccount(account.id, owner.username);
            if (owner.id === user?.id) {
                onOpenChange(false);
                onLeft();
                return;
            }
            onChanged({
                ...account,
                owners: account.owners.filter((id) => id !== owner.id),
                owners_details: owners.filter((item) => item.id !== owner.id),
            });
            toast.success(t("account.share.removed"));
        } catch (error) {
            // 400: the last owner cannot be removed.
            toast.error(t(error.response?.status === 400 ? "account.share.errors.last" : "core.fetch_error"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("account.share.title")}</DialogTitle>
                    <DialogDescription>{t("account.share.desc")}</DialogDescription>
                </DialogHeader>

                <ul className="space-y-2">
                    {owners.map((owner) => (
                        <li key={owner.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                            <span className="flex items-center gap-2 min-w-0">
                                <span className="truncate font-medium">{owner.username}</span>
                                {owner.id === user?.id && <Badge variant="secondary" className="text-[10px]">{t("account.share.you")}</Badge>}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy || owners.length <= 1}
                                onClick={() => handleRemove(owner)}
                            >
                                <UserMinusIcon /> {t(owner.id === user?.id ? "account.share.leave" : "account.share.remove")}
                            </Button>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleAdd} className="space-y-2">
                    <Label htmlFor="share-username">{t("account.share.add")}</Label>
                    <div className="flex gap-2">
                        <Input
                            id="share-username"
                            value={username}
                            maxLength={150}
                            autoComplete="off"
                            placeholder={t("core.login.fields.username.label")}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                        <Button type="submit" disabled={busy || !username.trim()}>
                            <UserPlusIcon /> {t("account.share.submit")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

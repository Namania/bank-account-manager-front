import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importStatement } from "@/api/account";

const MAX_BYTES = 1024 * 1024;

/** Import a CSV or OFX bank statement into an account. */
export default function ImportStatementDialog({ open, onOpenChange, account, onImported }) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{t("account.import.title")}</DialogTitle>
                    <DialogDescription>{t("account.import.desc")}</DialogDescription>
                </DialogHeader>
                {/* Mounted only while open: the previous result does not linger. */}
                <ImportForm account={account} onImported={onImported} />
            </DialogContent>
        </Dialog>
    );
}

function ImportForm({ account, onImported }) {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) return;
        if (file.size > MAX_BYTES) return setError(t("account.import.errors.too_large"));

        setBusy(true);
        setError("");
        setResult(null);
        try {
            const summary = await importStatement(account.id, file);
            setResult(summary);
            if (summary.created > 0) onImported();
        } catch (failure) {
            if (failure.response?.status === 400) {
                // The API says why the file cannot be read.
                const detail = failure.response.data?.file;
                setError([].concat(detail ?? t("account.import.errors.unreadable")).join(" "));
            } else {
                toast.error(t("core.fetch_error"));
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="statement-file">{t("account.import.file")}</Label>
                <Input
                    id="statement-file"
                    type="file"
                    accept=".csv,.ofx,text/csv,application/x-ofx"
                    onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); }}
                    required
                />
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            {result && (
                <div className="rounded-md border p-3 text-sm space-y-2">
                    <p>{t("account.import.result", { created: result.created, skipped: result.skipped })}</p>
                    {result.errors.length > 0 && (
                        <ul className="max-h-40 overflow-y-auto space-y-1 text-xs text-muted-foreground">
                            {result.errors.map((item) => (
                                <li key={`${item.line}-${item.error}`}>
                                    {t("account.import.line", { line: item.line })} : {item.error}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{t(result ? "core.close" : "core.cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={busy || !file}>{t("account.import.submit")}</Button>
            </DialogFooter>
        </form>
    );
}

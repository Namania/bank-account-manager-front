import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { changePassword, updateProfile } from "@/api/user";
import FadeAnimation from "@/components/animation/FadeAnimation";
import { StaggerGroup, StaggerItem } from "@/components/animation/Stagger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// DRF answers a 400 with { field: ["message", ...] }.
const fieldErrors = (error, field) => error.response?.data?.[field] ?? [];

function ErrorList({ messages }) {
    if (messages.length === 0) return null;
    return (
        <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
                {messages.map((message) => <p key={message}>{message}</p>)}
            </AlertDescription>
        </Alert>
    );
}

function ProfileForm() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [username, setUsername] = useState(user.username ?? "");
    const [email, setEmail] = useState(user.email ?? "");
    const [errors, setErrors] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setErrors([]);
        try {
            updateUser(await updateProfile({ username: username.trim(), email: email.trim() }));
            toast.success(t("profile.info.success"));
        } catch (error) {
            if (error.response?.status === 400) {
                setErrors([...fieldErrors(error, "username"), ...fieldErrors(error, "email")]);
            } else {
                toast.error(t("core.fetch_error"));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("profile.info.title")}</CardTitle>
                <CardDescription>{t("profile.info.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ErrorList messages={errors} />
                    <div className="space-y-2">
                        <Label htmlFor="profile-username">{t("core.login.fields.username.label")}</Label>
                        <Input
                            id="profile-username"
                            value={username}
                            maxLength={150}
                            autoComplete="username"
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile-email">{t("profile.info.email")}</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={email}
                            autoComplete="email"
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={saving}>{t("core.save")}</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function PasswordForm() {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [errors, setErrors] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmation) {
            return setErrors([t("profile.password.errors.mismatch")]);
        }

        setSaving(true);
        setErrors([]);
        try {
            await changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmation("");
            toast.success(t("profile.password.success"));
        } catch (error) {
            const status = error.response?.status;
            if (status === 400) {
                // The API explains why the new password is too weak, in its own words.
                const wrongCurrent = fieldErrors(error, "current_password").length > 0;
                setErrors([
                    ...(wrongCurrent ? [t("profile.password.errors.current")] : []),
                    ...fieldErrors(error, "new_password"),
                ]);
            } else if (status === 429) {
                setErrors([t("core.login.errors.throttled")]);
            } else {
                toast.error(t("core.fetch_error"));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("profile.password.title")}</CardTitle>
                <CardDescription>{t("profile.password.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ErrorList messages={errors} />
                    <div className="space-y-2">
                        <Label htmlFor="password-current">{t("profile.password.current")}</Label>
                        <Input
                            id="password-current"
                            type="password"
                            value={currentPassword}
                            autoComplete="current-password"
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-new">{t("profile.password.new")}</Label>
                        <Input
                            id="password-new"
                            type="password"
                            value={newPassword}
                            autoComplete="new-password"
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-confirmation">{t("profile.password.confirm")}</Label>
                        <Input
                            id="password-confirmation"
                            type="password"
                            value={confirmation}
                            autoComplete="new-password"
                            onChange={(event) => setConfirmation(event.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={saving}>{t("profile.password.submit")}</Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function Profile() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <div className="p-3 sm:p-6 space-y-6">
            <FadeAnimation>
                <Card className="bg-chart-3/10 border-chart-3/25">
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="size-14 rounded-xl">
                            <AvatarFallback className="rounded-xl bg-chart-3/20 text-chart-3 text-xl font-bold">
                                {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-xl font-bold truncate">{user.username}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email || t("profile.info.no_email")}</p>
                        </div>
                        {user.is_staff && <Badge className="ml-auto">{t("profile.info.staff")}</Badge>}
                    </CardContent>
                </Card>
            </FadeAnimation>
            <StaggerGroup className="grid gap-6 lg:grid-cols-2 items-start">
                <StaggerItem><ProfileForm /></StaggerItem>
                <StaggerItem><PasswordForm /></StaggerItem>
            </StaggerGroup>
        </div>
    );
}

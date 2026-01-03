import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const formSchema = z.object({
        username: z.string().min(2, t('core.login.errors.name')),
        password: z.string().min(6, t('core.login.errors.password')),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const { login } = useAuth();

    const onSubmit = async (values) => {
        try {
            setIsLoading(true);
            setError(null);
            await login(values);
            navigate('/', { replace: true });
        } catch (err) {
            setError(t('core.login.errors.invalid'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <Card className="w-full max-w-[400px] bg-card text-card-foreground border-border shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{t('core.login.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {error && (
                                <Alert variant="destructive" className="py-2 px-3">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">{error}</AlertDescription>
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-sm">{t('core.login.fields.username.label')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('core.login.fields.username.placeholder')}
                                                {...field}
                                                className="bg-background border-input focus-visible:ring-primary h-9"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[12px] text-muted-foreground/70 font-normal italic" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-sm">{t('core.login.fields.password.label')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={t('core.login.fields.password.placeholder')}
                                                {...field}
                                                className="bg-background border-input focus-visible:ring-primary h-9"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[12px] text-muted-foreground/70 font-normal italic" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-10 shadow-md transition-transform active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                {t('core.login.fields.send')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="fixed top-5 right-5 flex flex-reverse-row gap-3">
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </div>
    );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, BarChart3Icon, Loader2, RepeatIcon, Send, TargetIcon } from "lucide-react";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import { StaggerGroup, StaggerItem } from "@/components/animation/Stagger";
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
        username: z.string().min(2, t('core.login.errors.username')),
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
            setError(t(err.response?.status === 429 ? 'core.login.errors.throttled' : 'core.login.errors.invalid'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 dark:bg-card dark:text-card-foreground dark:border-r">
                <FadeAnimation className="flex items-center gap-3">
                    <img src="/images/logo.svg" alt="" className="h-12 w-12" />
                    <span className="text-xl font-semibold">Account Manager</span>
                </FadeAnimation>
                <div className="space-y-8">
                    <SlideYAnimation reverse delay={.3}>
                        <h1 className="text-4xl font-black tracking-tight leading-tight max-w-md">{t('core.login.tagline')}</h1>
                    </SlideYAnimation>
                    <StaggerGroup className="space-y-4">
                        {[
                            { icon: BarChart3Icon, key: 'stats' },
                            { icon: TargetIcon, key: 'budgets' },
                            { icon: RepeatIcon, key: 'recurring' },
                        ].map((feature) => (
                            <StaggerItem key={feature.key} className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15 dark:bg-chart-1/15 dark:text-chart-1">
                                    <feature.icon className="size-5" />
                                </span>
                                <span className="text-primary-foreground/90 dark:text-foreground">{t(`core.login.features.${feature.key}`)}</span>
                            </StaggerItem>
                        ))}
                    </StaggerGroup>
                </div>
                <span className="text-sm text-primary-foreground/70 dark:text-muted-foreground">v{__APP_VERSION__}</span>
            </div>
            <div className="flex items-center justify-center p-4">
            <SlideYAnimation reverse delay={.2} className="w-full max-w-[400px]">
            <Card className="w-full bg-card text-card-foreground border-border shadow-lg">
                <CardHeader className="space-y-1">
                    <img src="/images/logo.svg" alt="" className="h-12 w-12 mb-2 lg:hidden" />
                    <CardTitle className="text-2xl">{t('core.login.title')}</CardTitle>
                    <CardDescription>{t('core.login.subtitle')}</CardDescription>
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
                                                autoComplete="username"
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
                                                autoComplete="current-password"
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
                                disabled={isLoading}
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
            </SlideYAnimation>
            </div>
            <div className="fixed top-5 right-5 flex flex-reverse-row gap-3">
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </div>
    );
}

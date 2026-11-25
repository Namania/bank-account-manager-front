import { ArrowUpRightIcon, PlusIcon, UsersIcon, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccounts } from "@/api/account";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAccountDialog } from "@/components/CreateAccountDialog";
import { toast } from "sonner";
import FadeAnimation from "@/components/animation/FadeAnimation";
import AnimatedMoney from "@/components/animation/AnimatedMoney";
import { StaggerGroup, StaggerItem } from "@/components/animation/Stagger";
import { useAuth } from "@/auth/AuthContext";
import { tintFor } from "@/lib/tints";

export default function Accounts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isModalOpen, setIsModalOpen } = useOutletContext();

  const handleCreated = (created) => {
    setAccounts((prev) => [...prev, created]);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch {
        toast.error(t('core.fetch_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [t]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const total = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div className="p-4 space-y-6">
      <CreateAccountDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreated={handleCreated}
      />

      {accounts.length === 0 ? (
        <FadeAnimation delay={.3} className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-xl">
          <div className="p-4 rounded-full bg-chart-2/15 text-chart-2 mb-4">
            <Wallet className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground mb-4">{t('account.empty')}</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon /> {t('account.first')}
          </Button>
        </FadeAnimation>
      ) : (
        <>
          <FadeAnimation>
            <Card className="bg-primary text-primary-foreground border-0 shadow-lg dark:bg-chart-1/15 dark:text-foreground dark:border dark:border-chart-1/40">
              <CardHeader>
                <CardDescription className="text-primary-foreground/80 dark:text-muted-foreground">
                  {t('account.overview.greeting', { name: user?.username })}
                </CardDescription>
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80 dark:text-muted-foreground">
                  {t('account.overview.total')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end justify-between gap-4">
                <AnimatedMoney value={total} className="text-4xl sm:text-5xl font-black tracking-tight" />
                <span className="text-sm text-primary-foreground/80 dark:text-muted-foreground">
                  {t('account.overview.count', { count: accounts.length })}
                </span>
              </CardContent>
            </Card>
          </FadeAnimation>

          <StaggerGroup className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-stretch">
            {accounts.map((account) => {
              const tint = tintFor(account.id);
              const isShared = account.owners.length > 1;
              const isNegative = parseFloat(account.balance) < 0;

              return (
                <StaggerItem key={account.id} lift className="flex">
                  <Link to={`/account/${account.id}`} className="group flex w-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
                    <Card className={`w-full gap-4 transition-colors duration-200 ${tint.card}`}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tint.chip}`}>
                            <Wallet className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <CardTitle className="truncate">{account.label}</CardTitle>
                            <CardDescription>
                              {isShared ? t('account.shared', { count: account.owners.length - 1 }) : t('account.info.personal')}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </CardHeader>
                      <CardContent className="flex items-end justify-between gap-2">
                        <AnimatedMoney value={account.balance} className={`text-2xl font-bold ${isNegative ? 'text-destructive' : ''}`} />
                        {isShared && (
                          <Badge variant="secondary" className="gap-1">
                            <UsersIcon className="size-3" /> {t('account.info.shared')}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </>
      )}
    </div>
  );
}

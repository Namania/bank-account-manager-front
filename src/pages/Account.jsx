import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccount, deleteAccount, getAccounts, getBankAccount } from "@/api/account";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontalIcon, User, Wallet, PlusIcon, MinusIcon, LucideGitCompareArrows, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getTransactionsById } from "@/api/transaction";
import TransactionList from "@/components/TransactionList";
import TransactionDialog from "@/components/TransactionDialog";
import RenameAccountDialog from "@/components/RenameAccountDialog";
import ListPagination from "@/components/ListPagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCategories } from "@/api/category";
import { TransactionChart } from "@/components/TransactionChart";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideXAnimation from "@/components/animation/SlideXAnimation";
import { formatMoney } from "@/lib/format";

const PAGE_SIZE = 100;

export default function Account() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isModalOpen, setIsModalOpen } = useOutletContext();

  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [bank, setBank] = useState(null);
  const [transactionsData, setTransactionsData] = useState({ results: [], count: 0 });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // "credit", "debit" or "transfer" while the transaction dialog is open.
  const [transactionMode, setTransactionMode] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const updateAccount = async () => {
    setAccount(await getAccount(id));
  };

  const handleCreated = (created) => {
    setTransactionsData((prev) => ({
      ...prev,
      count: prev.count + 1,
      results: [created, ...prev.results]
    }));
    updateAccount();
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteAccount(id);
      navigate('/');
    } catch {
      toast.error(t('core.fetch_error'));
    } finally {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [accountRes, accountsRes, transRes, cat, bankRes] = await Promise.all([
          getAccount(id),
          getAccounts(),
          getTransactionsById(id, 1),
          getCategories(),
          getBankAccount()
        ]);

        if (!accountRes) {
          navigate('/');
          return;
        }
        setAccount(accountRes);
        setAccounts(accountsRes);
        setTransactionsData(transRes);
        setCategories(cat);
        setBank(bankRes);
      } catch {
        toast.error(t('core.fetch_error'));
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  useEffect(() => {
    const fetchNewPage = async () => {
      if (isLoading) return;
      setIsLoadingTransactions(true);
      try {
        const data = await getTransactionsById(id, currentPage);
        setTransactionsData(data);
      } catch {
        toast.error(t('core.fetch_error'));
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchNewPage();
  }, [currentPage, id]);

  if (isLoading || isLoadingTransactions) {
    return (
      <div className="p-6 grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[300px] md:col-span-1 rounded-xl" />
        <Skeleton className="h-[300px] md:col-span-2 rounded-xl" />
        <Skeleton className="h-[400px] md:col-span-3 rounded-xl" />
      </div>
    );
  }

  // The request failed: the error toast is already shown.
  if (!account) return null;

  const totalPages = Math.ceil(transactionsData.count / PAGE_SIZE);
  const isShared = account.owners.length > 1;
  const isPositive = parseFloat(account.balance) >= 0;

  return (
    <div className="p-6 space-y-8">
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('account.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('account.delete.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('core.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('core.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TransactionDialog
        open={transactionMode !== null}
        onOpenChange={(open) => { if (!open) setTransactionMode(null); }}
        mode={transactionMode ?? "transfer"}
        account={account}
        accounts={accounts}
        bank={bank}
        categories={categories}
        onSaved={handleCreated}
      />
      <RenameAccountDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        account={account}
        onRenamed={setAccount}
      />

      <div className="flex items-center justify-between mb-6">
        <SlideYAnimation delay={.2} className="text-2xl font-bold tracking-tight">{t('account.info.title')}</SlideYAnimation>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SlideXAnimation delay={.2} className="flex">
          <Card className="w-full border-muted bg-muted/0 shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlideXAnimation delay={.4} className="p-2 rounded-lg bg-emerald-500/10">
                  <User className="text-emerald-500 h-10 w-10" />
                </SlideXAnimation>
                <div className="flex flex-col gap-1">
                  <FadeAnimation delay={.5}>
                    <Label className="text-lg font-bold">
                      {account.label}
                    </Label>
                  </FadeAnimation>
                  <SlideYAnimation reverse delay={.3}>
                    <Badge variant={isShared ? 'secondary' : 'outlined'} className={isShared ? 'bg-blue-500 dark:bg-blue-600' : ''}>
                      {isShared ? t('account.info.shared') : t('account.info.personal')}
                    </Badge>
                  </SlideYAnimation>
                </div>
              </div>
              <SlideXAnimation reverse delay={.5}>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon-sm">
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuItem onSelect={() => setTransactionMode("credit")}>
                      <PlusIcon /> {t('account.info.actions.credit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTransactionMode("transfer")}>
                      <LucideGitCompareArrows /> {t('account.info.actions.over_account')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTransactionMode("debit")}>
                      <MinusIcon /> {t('account.info.actions.debit')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowRenameDialog(true)}>
                      <PencilIcon /> {t('account.rename.label')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SlideXAnimation>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <FadeAnimation delay={.8} className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{t('account.info.balance')}</FadeAnimation>
                <FadeAnimation delay={1} className={`text-3xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-800'}`}>
                  {formatMoney(account.balance, i18n.language)}
                </FadeAnimation>
              </div>
            </CardContent>
          </Card>
        </SlideXAnimation>

        <FadeAnimation delay={.3} className="lg:col-span-2">
          <Card className="border-dashed border-muted bg-muted/0 shadow-lg flex flex-col justify-center items-center p-8 min-h-[250px]">
            {transactionsData.results.length > 0 ?
              <TransactionChart pk={account.id} balance={account.balance} transactions={transactionsData.results} />
              : <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-muted rounded-full">
                  <Wallet className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('account.chart.empty_title')}</p>
                  <p className="text-xs text-muted-foreground/60">{t('account.chart.empty_desc')}</p>
                </div>
              </div>
            }
          </Card>
        </FadeAnimation>

        <div className="lg:col-span-3 pt-4 space-y-6">
          <div className="flex items-center justify-between">
            <SlideYAnimation delay={.3} className="text-2xl font-bold tracking-tight">{t('account.transactions.recent')}</SlideYAnimation>
            <FadeAnimation delay={.6}>
              <Badge variant="outline">{transactionsData.count} transactions</Badge>
            </FadeAnimation>
          </div>

          {transactionsData.results.length > 0 ? (
            <FadeAnimation delay={.8}>
              <TransactionList
                transactions={transactionsData.results}
                setTransactions={setTransactionsData}
                updateAccount={updateAccount}
                accounts={accounts}
                bank={bank}
                categories={categories}
              />
            </FadeAnimation>
          ) : (
            <FadeAnimation delay={.8}>
              <Card className="border-dashed border-muted bg-muted/0 shadow-lg flex flex-col justify-center items-center p-8 min-h-[250px]">
                <div className="p-12 text-center text-muted-foreground italic">
                  {t('account.transactions.empty')}
                </div>
              </Card>
            </FadeAnimation>
          )}

          <SlideYAnimation reverse delay={1}>
            <ListPagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          </SlideYAnimation>
        </div>

      </div>
    </div>
  );
}

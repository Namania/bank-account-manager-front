import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccount, deleteAccount, getAccounts, getBankAccount } from "@/api/account";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontalIcon, User, Wallet, PlusIcon, MinusIcon, LucideGitCompareArrows, PencilIcon, UsersIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getTransactionsById } from "@/api/transaction";
import { getMonthlyStats } from "@/api/stats";
import TransactionList from "@/components/TransactionList";
import TransactionDialog from "@/components/TransactionDialog";
import TransactionFilters from "@/components/TransactionFilters";
import { EMPTY_FILTERS, hasFilters } from "@/lib/filters";
import RenameAccountDialog from "@/components/RenameAccountDialog";
import ShareAccountDialog from "@/components/ShareAccountDialog";
import ImportStatementDialog from "@/components/ImportStatementDialog";
import ListPagination from "@/components/ListPagination";
import BalanceChart from "@/components/charts/BalanceChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCategories } from "@/api/category";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideXAnimation from "@/components/animation/SlideXAnimation";
import AnimatedMoney from "@/components/animation/AnimatedMoney";
import { tintFor } from "@/lib/tints";

const PAGE_SIZE = 100;

export default function Account() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isModalOpen, setIsModalOpen, setPageLabel } = useOutletContext();

  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [bank, setBank] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [transactionsData, setTransactionsData] = useState({ results: [], count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [months, setMonths] = useState([]);
  // Bumped whenever the balance moved, to read the list and the chart again.
  const [listVersion, setListVersion] = useState(0);
  const [statsVersion, setStatsVersion] = useState(0);

  // "credit", "debit" or "transfer" while the transaction dialog is open.
  const [transactionMode, setTransactionMode] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // The balance moved: read the account and its chart again.
  const refreshBalance = async () => {
    setStatsVersion((version) => version + 1);
    try {
      setAccount(await getAccount(id));
    } catch {
      toast.error(t('core.fetch_error'));
    }
  };

  const handleCreated = (created) => {
    setTransactionsData((prev) => ({
      ...prev,
      count: prev.count + 1,
      results: [created, ...prev.results]
    }));
    refreshBalance();
  };

  const handleImported = () => {
    setCurrentPage(1);
    setListVersion((version) => version + 1);
    refreshBalance();
  };

  const applyFilters = (next) => {
    setCurrentPage(1);
    setFilters(next);
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

  // The account and what its dialogs need.
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [accountRes, accountsRes, cat, bankRes] = await Promise.all([
          getAccount(id),
          getAccounts(),
          getCategories(),
          getBankAccount()
        ]);
        if (ignore) return;
        setAccount(accountRes);
        setAccounts(accountsRes);
        setCategories(cat);
        setBank(bankRes);
      } catch (error) {
        if (ignore) return;
        // Not ours, deactivated or unknown: back to the list.
        if (error.response?.status === 404) return navigate('/', { replace: true });
        toast.error(t('core.fetch_error'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [id, navigate, t]);

  // The breadcrumb shows the account's name.
  const accountLabel = account?.label;
  useEffect(() => {
    if (accountLabel) setPageLabel(accountLabel);
  }, [accountLabel, setPageLabel]);

  // Its transactions, for the current page and filters.
  useEffect(() => {
    let ignore = false;
    getTransactionsById(id, currentPage, filters)
      .then((data) => { if (!ignore) setTransactionsData(data); })
      .catch(() => { if (!ignore) toast.error(t('core.fetch_error')); });
    return () => { ignore = true; };
  }, [id, currentPage, filters, listVersion, t]);

  // Its balance month by month.
  useEffect(() => {
    let ignore = false;
    getMonthlyStats({ account: id })
      .then((data) => { if (!ignore) setMonths(data); })
      .catch(() => { if (!ignore) setMonths([]); });
    return () => { ignore = true; };
  }, [id, statsVersion]);

  if (isLoading) {
    return (
      <div className="p-3 sm:p-6 grid gap-6 md:grid-cols-3">
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
  const tint = tintFor(account.id);
  const hasTransactions = transactionsData.results.length > 0;

  return (
    <div className="p-3 sm:p-6 space-y-8">
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
      <ShareAccountDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        account={account}
        onChanged={setAccount}
        onLeft={() => navigate('/')}
      />
      <ImportStatementDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        account={account}
        onImported={handleImported}
      />

      <div className="flex items-center justify-between mb-6">
        <SlideYAnimation delay={.2} className="text-2xl font-bold tracking-tight">{t('account.info.title')}</SlideYAnimation>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SlideXAnimation delay={.2} className="flex">
          <Card className={`w-full shadow-lg overflow-hidden transition-colors ${tint.card}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <SlideXAnimation delay={.4} className={`p-2 rounded-lg ${tint.chip}`}>
                  <User className="h-10 w-10" />
                </SlideXAnimation>
                <div className="flex flex-col gap-1">
                  <FadeAnimation delay={.5}>
                    <Label className="text-lg font-bold">
                      {account.label}
                    </Label>
                  </FadeAnimation>
                  <SlideYAnimation reverse delay={.3}>
                    <Badge variant={isShared ? 'default' : 'outline'}>
                      {isShared ? t('account.info.shared') : t('account.info.personal')}
                    </Badge>
                  </SlideYAnimation>
                </div>
              </div>
              <SlideXAnimation reverse delay={.5}>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label={t('core.actions')} size="icon-sm" className="bg-background/60">
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52" align="end">
                    <DropdownMenuItem onSelect={() => setShowImportDialog(true)}>
                      <UploadIcon /> {t('account.import.label')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
                      <UsersIcon /> {t('account.share.label')}
                    </DropdownMenuItem>
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
                <FadeAnimation delay={1} className={`text-3xl font-black ${isPositive ? '' : 'text-destructive'}`}>
                  <AnimatedMoney value={account.balance} />
                </FadeAnimation>
              </div>
              <FadeAnimation delay={1.2} className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => setTransactionMode("credit")} disabled={!bank} className="flex-1 transition-transform active:scale-95">
                  <PlusIcon /> {t('account.info.actions.credit')}
                </Button>
                <Button variant="outline" onClick={() => setTransactionMode("debit")} disabled={!bank} className="flex-1 bg-background/60 transition-transform active:scale-95">
                  <MinusIcon /> {t('account.info.actions.debit')}
                </Button>
                <Button variant="outline" onClick={() => setTransactionMode("transfer")} className="flex-1 bg-background/60 transition-transform active:scale-95">
                  <LucideGitCompareArrows /> {t('account.info.actions.transfer')}
                </Button>
              </FadeAnimation>
              {!bank && (
                <p role="status" className="mt-3 text-xs text-muted-foreground">{t('transaction.no_bank')}</p>
              )}
            </CardContent>
          </Card>
        </SlideXAnimation>

        <FadeAnimation delay={.3} className="lg:col-span-2">
          <Card className="shadow-lg min-h-[250px] h-full">
            {months.length > 0 ? (
              <>
                <CardHeader>
                  <CardTitle>{t('account.chart.title')}</CardTitle>
                  <CardDescription>{t('account.chart.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceChart months={months} />
                </CardContent>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center space-y-3 p-8">
                <div className="p-3 rounded-full bg-chart-1/15 text-chart-1">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('account.chart.empty_title')}</p>
                  <p className="text-xs text-muted-foreground/60">{t('account.chart.empty_desc')}</p>
                </div>
              </div>
            )}
          </Card>
        </FadeAnimation>

        <div className="lg:col-span-3 pt-4 space-y-6">
          <div className="flex items-center justify-between">
            <SlideYAnimation delay={.3} className="text-2xl font-bold tracking-tight">{t('account.transactions.recent')}</SlideYAnimation>
            <FadeAnimation delay={.6}>
              <Badge variant="outline">{t('transaction.count', { count: transactionsData.count })}</Badge>
            </FadeAnimation>
          </div>

          <FadeAnimation delay={.6}>
            <TransactionFilters value={filters} onChange={applyFilters} categories={categories} />
          </FadeAnimation>

          {hasTransactions ? (
            <FadeAnimation delay={.8}>
              <TransactionList
                transactions={transactionsData.results}
                setTransactions={setTransactionsData}
                updateAccount={refreshBalance}
                accounts={accounts}
                bank={bank}
                categories={categories}
              />
            </FadeAnimation>
          ) : (
            <FadeAnimation delay={.8}>
              <Card className="border-dashed border-muted bg-muted/0 shadow-lg flex flex-col justify-center items-center p-8 min-h-[250px]">
                <div className="p-12 text-center text-muted-foreground italic">
                  {t(hasFilters(filters) ? 'transaction.filters.empty' : 'account.transactions.empty')}
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

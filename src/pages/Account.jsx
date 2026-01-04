import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccount, deleteAccount, getAccounts } from "@/api/account";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontalIcon, User, Wallet, PlusIcon, MinusIcon, LucideGitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createTransaction, getTransactionsById } from "@/api/transaction";
import TransactionList from "@/components/TransactionList";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/api/category";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Account() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isModalOpen, setIsModalOpen } = useOutletContext();

  const bankId = import.meta.env.VITE_BANK_ID;
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState("");

  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [transactionsData, setTransactionsData] = useState({ results: [], count: 0 });
  const [categories, setCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showDebitDialog, setShowDebitDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  const handleCredit = async (e) => {
    e.preventDefault();
    const amountInCents = parseFloat(amount);

    try {
      const response = await createTransaction({
        sender: bankId,
        receiver: account.id,
        amount: amountInCents,
        category: selectedCategory
      });

      setTransactionsData((prev) => ({
        ...prev,
        count: prev.count + 1,
        results: [response, ...prev.results]
      }));
      setShowCreditDialog(false);
      setAccount((prevAccount) => {
        if (!prevAccount) return null;
        
        return {
          ...prevAccount,
          balance: prevAccount.balance + (amount * 100)
        };
      });

      toast.success(t('account.created'));
    } catch (error) {
      toast.error(t('core.fetch_error'));
    }
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    const amountInCents = parseFloat(amount);

    try {
      const response = await createTransaction({
        sender: account.id,
        receiver: bankId,
        amount: amountInCents,
        category: selectedCategory
      });

      setTransactionsData((prev) => ({
        ...prev,
        count: prev.count + 1,
        results: [response, ...prev.results]
      }));
      setShowDebitDialog(false);
      setAccount((prevAccount) => {
        if (!prevAccount) return null;
        
        return {
          ...prevAccount,
          balance: prevAccount.balance - (amount * 100)
        };
      });

      toast.success(t('account.created'));
    } catch (error) {
      toast.error(t('core.fetch_error'));
    }
  };

  const handleOver = async (e) => {
    e.preventDefault();
    const amountInCents = parseFloat(amount);

    try {
      const response = await createTransaction({
        sender: account.id,
        receiver: selectedReceiver,
        amount: amountInCents,
        category: selectedCategory
      });

      setTransactionsData((prev) => ({
        ...prev,
        count: prev.count + 1,
        results: [response, ...prev.results]
      }));
      setShowTransactionDialog(false);
      setAccount((prevAccount) => {
        if (!prevAccount) return null;
        
        return {
          ...prevAccount,
          balance: prevAccount.balance - (amount * 100)
        };
      });

      toast.success(t('account.created'));
    } catch (error) {
      toast.error(t('core.fetch_error'));
    }
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteAccount(id);
      navigate('/');
    } catch (error) {
      toast.error(t('core.fetch_error'));
    } finally {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [accountRes, accountsRes, transRes, cat] = await Promise.all([
          getAccount(id),
          getAccounts(),
          getTransactionsById(id, 1),
          getCategories()
        ]);

        if (!accountRes) {
          navigate('/');
          return;
        }
        setAccount(accountRes);
        setAccounts(accountsRes);
        setTransactionsData(transRes);
        setCategories(cat);
      } catch (error) {
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
      } catch (error) {
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

  const totalPages = Math.ceil(transactionsData.count / 100);

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

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold tracking-tight">{t('account.info.title')}</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-muted bg-muted/0 shadow-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <User className="text-emerald-500 h-10 w-10" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-lg font-bold">
                  {account.label}
                </Label>
                <Badge variant={account.owners.length > 1 ? 'secondary' : 'outlined'} className={account.owners.length > 1 ? 'bg-blue-500 dark:bg-blue-600' : ''}>
                  {account.owners.length > 1 ? t('account.info.shared') : t('account.info.personal')}
                </Badge>
              </div>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onSelect={() => setShowCreditDialog(true)}>
                  <PlusIcon /> {t('account.info.actions.credit')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowTransactionDialog(true)}>
                  <LucideGitCompareArrows /> {t('account.info.actions.over_account')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowDebitDialog(true)}>
                  <MinusIcon /> {t('account.info.actions.debit')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCredit}>
                  <DialogHeader>
                    <DialogTitle>{t('account.transactions.credit')}</DialogTitle>
                    <DialogDescription>
                      {t('account.transactions.desc')}
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-3">
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.amount')}</FieldLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-muted-foreground sm:text-sm">€</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7"
                          onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          required
                        />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.category')}</FieldLabel>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('account.transactions.fields.category_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('core.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit">{t('core.create')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showDebitDialog} onOpenChange={setShowDebitDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleDebit}>
                  <DialogHeader>
                    <DialogTitle>{t('account.transactions.debit')}</DialogTitle>
                    <DialogDescription>
                      {t('account.transactions.desc')}
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-3">
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.amount')}</FieldLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-muted-foreground sm:text-sm">€</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7"
                          onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          required
                        />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.category')}</FieldLabel>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('account.transactions.fields.category_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('core.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit">{t('core.create')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleOver}>
                  <DialogHeader>
                    <DialogTitle>{t('account.transactions.over_account')}</DialogTitle>
                    <DialogDescription>
                      {t('account.transactions.desc')}
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-3">
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.receiver')}</FieldLabel>
                      <Select
                        value={selectedReceiver}
                        onValueChange={setSelectedReceiver}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('account.transactions.fields.receiver_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter((acc) => acc.id != account.id).map((acc) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.amount')}</FieldLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-muted-foreground sm:text-sm">€</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7"
                          onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                          required
                        />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel>{t('account.transactions.fields.category')}</FieldLabel>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('account.transactions.fields.category_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('core.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit">{t('core.create')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{t('account.info.balance')}</p>
              <div className={`text-3xl font-black ${account.balance >= 0 ? 'text-emerald-500' : 'text-red-800'}`}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance / 100)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-dashed border-muted bg-muted/0 shadow-lg flex flex-col justify-center items-center p-8 min-h-[250px]">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Wallet className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Graphique d'évolution</p>
              <p className="text-xs text-muted-foreground/60">Les données seront disponibles après vos premières transactions</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 pt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">{t('account.transactions.recent')}</h3>
            <Badge variant="outline">{transactionsData.count} transactions</Badge>
          </div>

          {transactionsData.results.length > 0 ? (
            <TransactionList transactions={transactionsData.results} />
          ) : (
            <div className="p-12 text-center text-muted-foreground italic">
              {t('account.transactions.empty')}
            </div>
          )}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <PaginationEllipsis key={pageNum} />;
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

      </div>
    </div>
  );
}

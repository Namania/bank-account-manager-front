import { PlusIcon, Wallet } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccounts } from "@/api/account";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { CreateAccountDialog } from "@/components/CreateAccountDialog";

export default function Account() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isModalOpen, setIsModalOpen } = useOutletContext();

  const handleCreated = (newCat) => {
    setAccounts((prev) => [...prev, newCat]);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground mb-4">{t('account.empty')}</p>
        <Button asChild>
          <Link to="/accounts/new">
            <PlusIcon className="mr-2 h-4 w-4" /> {t('account.first')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-stretch">
      <CreateAccountDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreated={handleCreated}
      />
      {accounts.map((account) => (
        <Link 
          key={account.id} 
          to={`/transaction/${account.id}`}
          className="group flex"
        >
          <Card className="flex flex-col h-full w-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex-none">
                <CardTitle className="font-bold">
                  {account.label}
                </CardTitle>
                <CardDescription>
                  {account.owners.length > 1 ? t('account.shared', {count: account.owners.length - 1}) : ''}
                </CardDescription>
              </div>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            {/* <CardContent>
              <Badge variant={account.balance >= 0 ? "secondary" : "destructive"} className="ml-2">
                {account.balance >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                2.5%
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Dernière transaction : il y a 2 heures
              </p>
            </CardContent> */}
            <CardFooter className="mt-auto pt-0">
              {
                account.balance > 0 ?
                  <Badge className={`text-1xl bg-green-700 text-forground`}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance / 100)}
                  </Badge>
                  : <Badge className={`text-1xl bg-red-700 text-forground`}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance / 100)}
                  </Badge>
              }
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

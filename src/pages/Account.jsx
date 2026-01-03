import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccounts } from "@/api/getAccounts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Account() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Erreur lors du chargement des comptes", error);
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Link 
          key={account.id} 
          to={`/transaction/${account.id}`}
          className="group block"
        >
          <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.label}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance)}
                </div>
                {/* <Badge variant={account.balance >= 0 ? "secondary" : "destructive"} className="ml-2">
                  {account.balance >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  2.5%
                </Badge> */}
              </div>
              {/* <p className="text-xs text-muted-foreground mt-2">
                Dernière transaction : il y a 2 heures
              </p> */}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

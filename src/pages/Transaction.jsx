import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getTransactions } from "@/api/transaction";
import { getAccounts, getBankAccount } from "@/api/account";
import { getCategories } from "@/api/category";
import { useTranslation } from "react-i18next";
import TransactionList from "@/components/TransactionList";
import ListPagination from "@/components/ListPagination";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 100;

export default function Transaction() {
    const { t } = useTranslation();

    const [data, setData] = useState({ count: 0, results: [] });
    const [currentPage, setCurrentPage] = useState(1);
    // What the edit dialog needs to offer: accounts, the bank and categories.
    const [references, setReferences] = useState({ accounts: [], bank: null, categories: [] });

    const totalPages = Math.ceil(data.count / PAGE_SIZE);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const responseData = await getTransactions(currentPage);
                setData(responseData);
            } catch {
                toast.error(t('core.fetch_error'));
            }
        };

        fetchTransactions();
    }, [currentPage, t]);

    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const [accounts, bank, categories] = await Promise.all([getAccounts(), getBankAccount(), getCategories()]);
                setReferences({ accounts, bank, categories });
            } catch {
                toast.error(t('core.fetch_error'));
            }
        };

        fetchReferences();
    }, [t]);

    return (
        <div className="space-y-6 p-6">
            <div className="min-h-[400px]">
                {data.results.length > 0 ? (
                    <FadeAnimation delay={.8}>
                        <TransactionList
                            transactions={data.results}
                            setTransactions={setData}
                            accounts={references.accounts}
                            bank={references.bank}
                            categories={references.categories}
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
            </div>
            <SlideYAnimation reverse delay={.4}>
                <ListPagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </SlideYAnimation>
        </div>
    );
}

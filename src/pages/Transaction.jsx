import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getTransactions } from "@/api/transaction";
import { getAccounts, getBankAccount } from "@/api/account";
import { getCategories } from "@/api/category";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import TransactionDialog from "@/components/TransactionDialog";
import TransactionList from "@/components/TransactionList";
import TransactionFilters from "@/components/TransactionFilters";
import { EMPTY_FILTERS, hasFilters } from "@/lib/filters";
import ListPagination from "@/components/ListPagination";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 100;

export default function Transaction() {
    const { t } = useTranslation();
    // Opened by the header button.
    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const [data, setData] = useState({ count: 0, results: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    // Bumped after a creation, to read the list again with its filters and order.
    const [version, setVersion] = useState(0);
    // What the filters and the edit dialog offer: accounts, the bank and categories.
    const [references, setReferences] = useState({ accounts: [], bank: null, categories: [] });

    const totalPages = Math.ceil(data.count / PAGE_SIZE);

    const applyFilters = (next) => {
        setCurrentPage(1);
        setFilters(next);
    };

    useEffect(() => {
        let ignore = false;
        getTransactions(currentPage, filters)
            .then((responseData) => { if (!ignore) setData(responseData); })
            .catch(() => { if (!ignore) toast.error(t('core.fetch_error')); });
        return () => { ignore = true; };
    }, [currentPage, filters, version, t]);

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
        <div className="space-y-6 p-3 sm:p-6">
            <TransactionDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                mode="new"
                accounts={references.accounts}
                bank={references.bank}
                categories={references.categories}
                onSaved={() => { setCurrentPage(1); setVersion((current) => current + 1); }}
            />
            <FadeAnimation delay={.4}>
                <TransactionFilters
                    value={filters}
                    onChange={applyFilters}
                    categories={references.categories}
                    accounts={references.accounts}
                />
            </FadeAnimation>
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
                            {t(hasFilters(filters) ? 'transaction.filters.empty' : 'account.transactions.empty')}
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

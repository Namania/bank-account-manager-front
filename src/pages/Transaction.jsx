import { useEffect, useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { getTransactions } from "@/api/transaction";
import { useTranslation } from "react-i18next";
import TransactionList from "@/components/TransactionList";
import FadeAnimation from "@/components/animation/FadeAnimation";
import SlideYAnimation from "@/components/animation/SlideYAnimation";
import { Card } from "@/components/ui/card";

export default function Transaction() {
    const { t } = useTranslation();

    const [data, setData] = useState({ count: 0, results: [] });
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 100;
    const totalPages = Math.ceil(data.count / pageSize);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const responseData = await getTransactions(currentPage);
                setData(responseData);
            } catch (error) {
                toast.error(t('core.fetch_error'));
            }
        };

        fetchTransactions();
    }, [currentPage, t]);

    return (
        <div className="space-y-6 p-6">
            <div className="min-h-[400px]">
                {data.results.length > 0 ? (
                    <FadeAnimation delay={.8}>
                        <TransactionList transactions={data.results} setTransactions={setData} />
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
            </SlideYAnimation>
        </div>
    );
}

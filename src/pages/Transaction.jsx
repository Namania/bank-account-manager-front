import { useEffect, useState } from "react";
import axios from "axios";
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
import { TransactionTableSkeleton } from "@/components/TransactionTableSkeleton";

export default function Transaction() {
    const { t } = useTranslation();

    const [data, setData] = useState({ count: 0, results: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const pageSize = 100;
    const totalPages = Math.ceil(data.count / pageSize);

    useEffect(() => {
        const fetchTransactions = async () => {
        setIsLoading(true);
            try {
                const responseData = await getTransactions(currentPage);
                setData(responseData);
            } catch (error) {
                toast.error(t('core.fetch_error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [currentPage, t]);

    return (
        <div className="space-y-6 p-6">
            <div className="min-h-[400px]">
                {isLoading ? (
                    <TransactionTableSkeleton />
                ) : (
                    <TransactionList transactions={data.results} />
                )}
            </div>
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
    );
}

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

/** Page links for a paginated list: first, last and the pages around the current one. */
export default function ListPagination({ currentPage, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const go = (page) => (event) => {
        event.preventDefault();
        if (page >= 1 && page <= totalPages) onChange(page);
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={go(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                        return (
                            <PaginationItem key={page}>
                                <PaginationLink href="#" isActive={currentPage === page} onClick={go(page)}>
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    }
                    if (Math.abs(page - currentPage) === 2) {
                        return <PaginationEllipsis key={page} />;
                    }
                    return null;
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={go(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

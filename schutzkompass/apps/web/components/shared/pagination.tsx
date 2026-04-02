'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Optional: allow user to change page size */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      {/* Left: summary + page size */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {start}–{end} von {totalItems}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} pro Seite
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: pagination buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Erste Seite"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Vorherige Seite"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Nächste Seite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            title="Letzte Seite"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage pagination state.
 * Returns paginated items + pagination props.
 */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page exceeds total
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    paginatedItems,
    paginationProps: {
      currentPage: safePage,
      totalItems,
      pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    setCurrentPage,
  };
}

import React, { useMemo, useState } from "react";

/**
 * Generic DataTable with optional server-side or client-side pagination.
 *
 * Props:
 * - columns: Array<{ key: string, header: string, align?: 'left'|'right'|'center', width?: string, className?: string, render?: (row, idx) => ReactNode }>
 * - data: any[]
 * - rowKey?: string | ((row, idx) => string)
 * - emptyMessage?: string
 * - total?: number            // provide for server-side pagination
 * - page?: number             // 1-based
 * - limit?: number
 * - onPageChange?: (page:number) => void
 * - clientPaginate?: boolean  // if true, paginate locally using pageSize
 * - pageSize?: number         // used when clientPaginate
 * - striped?: boolean         // alternate row colors
 * - hover?: boolean           // enable hover effects
 * - compact?: boolean         // compact mode with smaller padding
 */
const DataTable = ({
  columns,
  data,
  rowKey = "id",
  emptyMessage = "No records found",
  total,
  page,
  limit,
  onPageChange,
  clientPaginate = false,
  pageSize = 10,
  striped = true,
  hover = true,
  compact = false,
  /**
   * textClass lets consumers override the base text color (supports dark mode tokens).
   * Example: textClass="text-gray-800 dark:text-gray-100" or "text-[var(--text-primary)]".
   */
  textClass = "text-gray-700",
}) => {
  // client-side pagination state
  const [clientPage, setClientPage] = useState(1);

  const paging = useMemo(() => {
    if (clientPaginate || (total == null && !onPageChange)) {
      const start = (clientPage - 1) * pageSize;
      const sliced = data.slice(start, start + pageSize);
      return {
        rows: sliced,
        page: clientPage,
        limit: pageSize,
        total: data.length,
        server: false,
      };
    }
    return {
      rows: data,
      page: page || 1,
      limit: limit || data.length || 10,
      total: total ?? data.length,
      server: true,
    };
  }, [
    clientPaginate,
    clientPage,
    pageSize,
    data,
    total,
    page,
    limit,
    onPageChange,
  ]);

  const canPrev = paging.page > 1;
  const canNext = paging.page * paging.limit < paging.total;

  const handlePrev = () => {
    if (!canPrev) return;
    if (paging.server && onPageChange) onPageChange(paging.page - 1);
    else setClientPage((p) => Math.max(1, p - 1));
  };
  const handleNext = () => {
    if (!canNext) return;
    if (paging.server && onPageChange) onPageChange(paging.page + 1);
    else setClientPage((p) => p + 1);
  };

  const getRowKey = (row, idx) =>
    typeof rowKey === "function" ? rowKey(row, idx) : row[rowKey] ?? idx;

  const paddingClass = compact ? "px-4 py-2" : "px-6 py-4";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ color: "black" }}
                  className={`${paddingClass} text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${
                    c.className || ""
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paging.rows.map((row, idx) => (
              <tr
                key={getRowKey(row, idx)}
                className={`
                  transition-all duration-150
                  ${striped && idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  ${hover ? "hover:bg-blue-50 hover:shadow-sm" : ""}
                  border-b border-gray-100
                `}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`
                      ${paddingClass} 
                      text-sm 
                      ${textClass}
                      ${
                        c.align === "right"
                          ? "text-right"
                          : c.align === "center"
                          ? "text-center"
                          : "text-left"
                      }
                      whitespace-nowrap
                      transition-colors duration-150
                      relative
                    `}
                  >
                    {c.render ? c.render(row, idx) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paging.rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${paddingClass} text-center py-12`}
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-400 mb-2">
                      {emptyMessage}
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paging.total > paging.limit && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">
                {(paging.page - 1) * paging.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(paging.page * paging.limit, paging.total)}
              </span>{" "}
              of <span className="font-semibold">{paging.total}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  {
                    length: Math.min(5, Math.ceil(paging.total / paging.limit)),
                  },
                  (_, i) => {
                    const pageNumber = i + 1;
                    const isCurrent = pageNumber === paging.page;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => {
                          if (paging.server && onPageChange)
                            onPageChange(pageNumber);
                          else setClientPage(pageNumber);
                        }}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isCurrent
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}
                {Math.ceil(paging.total / paging.limit) > 5 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
              </div>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

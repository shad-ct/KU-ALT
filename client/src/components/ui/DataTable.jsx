import React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Format date consistently as "12 Nov 2026"
 */
export const formatDisplayDate = (dateVal) => {
  if (!dateVal) return 'Not set';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Not set';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * DataTable Component
 * Calm, trustworthy table matching product specifications:
 * - 44px sentence-case header (13/20 500, surface-sub bg)
 * - 56px body rows with 12x16 padding, hairline dividers, whole-row click
 * - Pagination footer (10/25/50) with "Showing X-Y of Z"
 * - Mobile stacked cards view on screens < 640px
 */
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items matching this criteria.',
  onRowClick = null,
  sortKey = null,
  sortDirection = 'asc',
  onSort = null,
  pagination = null,
  showMobileCards = true,
  className = '',
}) => {
  // Enforce max 25 rows inline per spec
  const displayData = data.slice(0, 25);

  return (
    <div className={`bg-surface border border-border rounded-md overflow-hidden ${className}`}>
      {/* Desktop / Tablet Table View (>= 640px) */}
      <div className={`overflow-x-auto ${showMobileCards ? 'hidden sm:block' : 'block'}`}>
        <table className="w-full text-left text-[15px] leading-[24px] border-collapse">
          {/* 44px Sentence Case Header */}
          <thead className="bg-surface-sub border-b border-border text-text-muted">
            <tr className="h-[44px]">
              {columns.map((col, idx) => {
                const isSortable = col.sortable && onSort;
                const isRight = col.align === 'right' || col.isNumeric;

                return (
                  <th
                    key={col.key || idx}
                    scope="col"
                    className={`px-4 py-2 text-[13px] leading-[20px] font-medium select-none ${
                      isRight ? 'text-right' : 'text-left'
                    } ${isSortable ? 'cursor-pointer hover:text-text' : ''} ${col.width || ''}`}
                    onClick={() => isSortable && onSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${isRight ? 'justify-end w-full' : ''}`}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <ArrowUpDown
                          size={14}
                          strokeWidth={1.75}
                          className={`text-text-muted ${sortKey === col.key ? 'text-accent-600' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
              {onRowClick && (
                <th scope="col" className="w-[72px] px-4 py-2 text-right text-[13px] font-medium">
                  <span className="sr-only">Action</span>
                </th>
              )}
            </tr>
          </thead>

          {/* 56px Body Rows */}
          <tbody className="divide-y divide-border bg-surface">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onRowClick ? 1 : 0)} className="h-[160px] text-center text-text-muted">
                  <div className="inline-flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent-600 animate-pulse" />
                    <span className="text-[14px]">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onRowClick ? 1 : 0)} className="h-[180px] text-center p-8">
                  <h3 className="text-[16px] font-semibold text-text mb-1">{emptyTitle}</h3>
                  <p className="text-[13px] text-text-muted">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`h-[56px] transition-colors duration-fast ${
                    onRowClick ? 'cursor-pointer hover:bg-surface-sub' : ''
                  }`}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((col, colIdx) => {
                    const isRight = col.align === 'right' || col.isNumeric;
                    const val = row[col.key];

                    return (
                      <td
                        key={col.key || colIdx}
                        className={`px-4 py-3 text-[15px] leading-[24px] text-text ${
                          isRight ? 'text-right tabular-nums' : 'text-left'
                        } ${colIdx === 0 ? 'font-medium' : ''}`}
                      >
                        {col.render ? (
                          col.render(val, row)
                        ) : val !== null && val !== undefined && val !== '' ? (
                          String(val)
                        ) : (
                          <span className="text-text-subtle">Not set</span>
                        )}
                      </td>
                    );
                  })}

                  {onRowClick && (
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center text-[13px] font-medium text-accent-600 hover:text-accent-700">
                        View
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (< 640px) */}
      {showMobileCards && (
        <div className="sm:hidden divide-y divide-border bg-surface">
          {isLoading ? (
            <div className="p-8 text-center text-text-muted text-[14px]">Loading records...</div>
          ) : displayData.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-[16px] font-semibold text-text mb-1">{emptyTitle}</h3>
              <p className="text-[13px] text-text-muted">{emptyMessage}</p>
            </div>
          ) : (
            displayData.map((row, idx) => (
              <div
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className="p-4 space-y-2 hover:bg-surface-sub transition-colors cursor-pointer"
              >
                {/* Primary Card Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-[15px] text-text">
                    {columns[0]?.render ? columns[0].render(row[columns[0].key], row) : row[columns[0]?.key]}
                  </div>
                  {columns.find(c => c.key === 'status')?.render ? (
                    columns.find(c => c.key === 'status').render(row.status, row)
                  ) : null}
                </div>

                {/* Additional Metadata Fields */}
                <div className="text-[13px] text-text-muted space-y-1">
                  {columns.slice(1).filter(c => c.key !== 'status').map(c => (
                    <div key={c.key} className="flex justify-between items-baseline gap-2">
                      <span className="text-text-muted">{c.header}:</span>
                      <span className="text-text text-right font-normal">
                        {c.render ? c.render(row[c.key], row) : (row[c.key] || 'Not set')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && (
        <div className="h-[52px] px-4 border-t border-border flex items-center justify-between text-[13px] text-text-muted bg-surface">
          <div>
            Showing{' '}
            <span className="font-medium text-text tabular-nums">
              {Math.min(
                ((pagination.page || 1) - 1) * (pagination.limit || 10) + 1,
                pagination.total || displayData.length
              )}
            </span>
            -
            <span className="font-medium text-text tabular-nums">
              {Math.min((pagination.page || 1) * (pagination.limit || 10), pagination.total || displayData.length)}
            </span>{' '}
            of <span className="font-medium text-text tabular-nums">{pagination.total || displayData.length}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange?.(pagination.page - 1)}
              className="h-8 px-2.5 rounded-md border border-border bg-surface text-text hover:bg-surface-sub disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium inline-flex items-center gap-1"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              type="button"
              disabled={pagination.page >= (pagination.totalPages || 1)}
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              className="h-8 px-2.5 rounded-md border border-border bg-surface text-text hover:bg-surface-sub disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium inline-flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

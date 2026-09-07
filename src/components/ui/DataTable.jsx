import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Filter, 
  SlidersHorizontal,
  Inbox
} from 'lucide-react';
import Button from './Button';
import EmptyState from './EmptyState';

/**
 * Enterprise-grade Responsive DataTable for RouteWise Management Pages.
 * - Auto-collapses into sleek cards on small screens (< 768px).
 * - Full desktop table with sorting, pagination, and search.
 * - Empty & Loading states included.
 */
export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  searchPlaceholder = 'Search records...',
  searchField = null, // key or custom filter function
  actions = null, // function (row) => JSX
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the current criteria.',
  emptyActionText = null,
  onEmptyAction = null,
  initialPageSize = 10,
  filterComponent = null,
  headerAction = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (typeof searchField === 'function') {
        return searchField(item, query);
      }
      if (typeof searchField === 'string') {
        const val = item[searchField];
        return val ? String(val).toLowerCase().includes(query) : false;
      }
      // Default: search all string/number fields of the row
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchField]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginated dataset
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </div>
          {filterComponent && (
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="sm:hidden p-2 rounded-xl bg-white border border-border text-brand-navy"
              aria-label="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {filterComponent && (
            <div className="hidden sm:block">
              {filterComponent}
            </div>
          )}
          {headerAction}
        </div>
      </div>

      {/* Mobile Filter Drawer / Collapsible */}
      {filterComponent && showMobileFilter && (
        <div className="sm:hidden p-3 bg-white border border-border rounded-xl space-y-2">
          {filterComponent}
        </div>
      )}

      {/* Loading Skeleton View */}
      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sortedData.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
          actionText={emptyActionText}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-hidden bg-white border border-border rounded-2xl shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                    {columns.map((col) => (
                      <th
                        key={col.key || col.header}
                        className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer select-none hover:text-brand-navy' : ''} ${col.className || ''}`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable && (
                            <ArrowUpDown className={`w-3 h-3 ${sortField === col.key ? 'text-brand-blue' : 'text-slate-400'}`} />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && (
                      <th className="px-4 py-3.5 text-right font-bold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {paginatedData.map((row, index) => (
                    <tr 
                      key={row[keyField] || index} 
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key || col.header} className={`px-4 py-3.5 text-brand-navy ${col.cellClassName || ''}`}>
                          {col.render ? col.render(row) : (row[col.key] ?? '—')}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {actions(row)}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (< 768px) */}
          <div className="md:hidden space-y-3">
            {paginatedData.map((row, index) => (
              <div 
                key={row[keyField] || index}
                className="bg-white border border-border rounded-xl p-4 shadow-soft space-y-2.5"
              >
                {columns.map((col) => (
                  <div key={col.key || col.header} className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-semibold text-brand-slate text-[11px] uppercase tracking-wide shrink-0">
                      {col.header}:
                    </span>
                    <span className="text-brand-navy text-right font-medium">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                    {actions(row)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 text-xs text-brand-slate">
              <p>
                Showing <span className="font-semibold text-brand-navy">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-brand-navy">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </span>{' '}
                of <span className="font-semibold text-brand-navy">{sortedData.length}</span> results
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <span className="px-3 py-1 font-semibold text-brand-navy">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;

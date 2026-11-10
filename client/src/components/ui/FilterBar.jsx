import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * FilterBar Component
 * - Segmented control with counts
 * - Debounced search with leading icon and clear button
 */
export const FilterBar = ({
  tabs = [],
  activeTab = 'ALL',
  onTabChange = () => {},
  searchValue = '',
  onSearchChange = null,
  searchPlaceholder = 'Search applications...',
  extraFilters = null,
  className = '',
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // 300ms debounce on search
  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 ${className}`}>
      {/* Segmented Control Tabs */}
      {tabs.length > 0 && (
        <div
          className="bg-surface-sub p-1 rounded-md border border-border inline-flex items-center gap-1 overflow-x-auto max-w-full"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.key)}
                className={`h-[32px] px-3 rounded text-[13px] leading-[20px] font-medium transition-all duration-fast whitespace-nowrap inline-flex items-center gap-2 ${
                  isActive
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] font-normal tabular-nums px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-surface-sub text-text' : 'bg-surface/60 text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: Search Input */}
      <div className="flex items-center gap-3">
        {extraFilters}

        {onSearchChange && (
          <div className="relative w-full sm:w-[260px]">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-[40px] pl-9 pr-8 bg-surface border border-border-strong rounded-md text-[14px] text-text placeholder:text-text-subtle focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/40"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text"
                aria-label="Clear search"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '../types';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  designers: string[];
  shows: string[];
  tags: string[];
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  designers,
  shows,
  tags,
}) => {
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = tags.filter(
    (t) =>
      t.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !filters.tags.includes(t)
  );

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFilterChange({ ...filters, tags: [...filters.tags, tag] });
    }
    setTagSearch('');
    setShowTagDropdown(false);
  };

  const removeTag = (tag: string) => {
    onFilterChange({
      ...filters,
      tags: filters.tags.filter((t) => t !== tag),
    });
  };

  const clearAll = () => {
    onFilterChange({
      section: filters.section,
      designer: '',
      show: '',
      tags: [],
      search: '',
    });
  };

  const hasFilters =
    filters.designer || filters.show || filters.tags.length > 0 || filters.search;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск по заметкам..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
            />
          </div>

          {/* Designer Select */}
          <select
            value={filters.designer}
            onChange={(e) =>
              onFilterChange({ ...filters, designer: e.target.value })
            }
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">Все дизайнеры</option>
            {designers.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Show Select */}
          <select
            value={filters.show}
            onChange={(e) =>
              onFilterChange({ ...filters, show: e.target.value })
            }
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">Все показы</option>
            {shows.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Tags */}
          <div ref={tagRef} className="relative">
            <div className="flex items-center gap-1 flex-wrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl min-w-[160px]">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white rounded-md text-xs"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={filters.tags.length === 0 ? 'Теги...' : ''}
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setShowTagDropdown(true);
                }}
                onFocus={() => setShowTagDropdown(true)}
                className="flex-1 min-w-[60px] bg-transparent text-sm focus:outline-none py-0.5"
              />
            </div>
            {showTagDropdown && filteredTags.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;

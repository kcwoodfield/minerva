import { useEffect, useState } from 'react';
import { LayoutList, Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useLibraryStore } from '../stores/libraryStore';

type StatusChip = { label: string; value: 'reading' | 'finished' | 'unread' | null };

const STATUS_CHIPS: StatusChip[] = [
  { label: 'All',      value: null },
  { label: 'Reading',  value: 'reading' },
  { label: 'Finished', value: 'finished' },
  { label: 'Unread',   value: 'unread' },
];

const SORT_OPTIONS = [
  { label: 'Date added',   value: 'dateAdded' },
  { label: 'Title',        value: 'title' },
  { label: 'Author',       value: 'author' },
  { label: 'Rating',       value: 'rating' },
  { label: 'Progress',     value: 'completed' },
];

export function FilterBar() {
  const { filters, setFilters, sortBy, ascending, setSort, view, setView } = useLibraryStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const activeStatus = filters.status ?? null;

  return (
    <div
      className="flex items-center justify-between gap-4 border-b border-rule-soft"
      style={{ paddingBottom: 18, marginBottom: 0 }}
    >
      {/* Left: search + status chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <svg
            width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="#9C9789" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="absolute pointer-events-none"
            style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Search title, author, or ISBN…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ paddingLeft: 38, width: 240 }}
          />
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-1.5">
          {STATUS_CHIPS.map((chip) => {
            const active = activeStatus === chip.value;
            return (
              <button
                key={chip.label}
                onClick={() => setFilters({ status: chip.value })}
                className="font-serif transition-colors duration-[140ms]"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 13,
                  padding: '4px 10px 5px',
                  borderRadius: 9999,
                  border: `1px solid ${active ? '#1B1A17' : '#E5DFCE'}`,
                  background: active ? '#1B1A17' : 'transparent',
                  color: active ? '#FAF8F2' : '#6B665C',
                  cursor: 'pointer',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: sort + view toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="t-meta" style={{ whiteSpace: 'nowrap' }}>Sort by</span>
          <select
            value={`${sortBy}:${ascending ? 'asc' : 'desc'}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':');
              setSort(field, dir === 'asc');
            }}
            className="font-serif text-ink-mute bg-transparent border-none outline-none cursor-pointer"
            style={{ fontSize: 13 }}
          >
            {SORT_OPTIONS.map((o) => [
              <option key={`${o.value}:desc`} value={`${o.value}:desc`}>{o.label} ↓</option>,
              <option key={`${o.value}:asc`} value={`${o.value}:asc`}>{o.label} ↑</option>,
            ])}
          </select>
        </div>

        {/* View toggle */}
        <div
          className="flex"
          style={{
            border: '1px solid #E5DFCE',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {(['list', 'grid'] as const).map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  background: active ? '#1B1A17' : 'transparent',
                  color: active ? '#FAF8F2' : '#9C9789',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 140ms, color 140ms',
                }}
                title={v === 'list' ? 'List view' : 'Grid view'}
              >
                {v === 'list'
                  ? <LayoutList style={{ width: 15, height: 15 }} />
                  : <Grid3X3 style={{ width: 15, height: 15 }} />
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

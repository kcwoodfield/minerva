import { useEffect, useRef, useState } from 'react';
import { LayoutList, Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useLibraryStore } from '../stores/libraryStore';
import { useLibraryFilters, useLibrarySort, useLibraryView } from '../stores/librarySelectors';

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
  const filters = useLibraryFilters();
  const { sortBy, ascending } = useLibrarySort();
  const view = useLibraryView();
  const setFilters = useLibraryStore((s) => s.setFilters);
  const setSort = useLibraryStore((s) => s.setSort);
  const setView = useLibraryStore((s) => s.setView);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, filters.search, setFilters]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeStatus = filters.status ?? null;

  return (
    <div
      className="flex items-center justify-between gap-4 border-b border-rule-soft"
      style={{ paddingBottom: 18, marginBottom: 0 }}
    >
      {/* Left: search + status chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="absolute pointer-events-none text-ink-faint"
            style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            ref={inputRef}
            placeholder="Search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ paddingLeft: 36, paddingRight: 48, width: 200 }}
          />
          <kbd
            className="absolute pointer-events-none font-sans text-ink-faint"
            style={{ right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11 }}
          >
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-1.5">
          {STATUS_CHIPS.map((chip) => {
            const active = activeStatus === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => setFilters({ status: chip.value })}
                className="chip-filter font-serif"
                data-active={active}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: sort + view toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {view === 'grid' && (
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
        )}

        <div className="segment-toggle">
          {(['list', 'grid'] as const).map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="segment-toggle__btn"
                data-active={active}
                aria-pressed={active}
                aria-label={v === 'list' ? 'List view' : 'Grid view'}
                title={v === 'list' ? 'List view' : 'Grid view'}
              >
                {v === 'list'
                  ? <LayoutList className="size-[15px] shrink-0" strokeWidth={1.75} />
                  : <Grid3X3 className="size-[15px] shrink-0" strokeWidth={1.75} />
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

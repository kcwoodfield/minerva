import { LayoutList, Grid3X3 } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import { useLibrarySort, useLibraryView } from '../stores/librarySelectors';

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
  const { sortBy, ascending } = useLibrarySort();
  const view = useLibraryView();
  const setFilters = useLibraryStore((s) => s.setFilters);
  const setSort = useLibraryStore((s) => s.setSort);
  const setView = useLibraryStore((s) => s.setView);
  const activeStatus = useLibraryStore((s) => s.filters.status ?? null);

  return (
    <div
      className="flex items-center justify-between gap-4 border-b border-rule-soft"
      style={{ paddingBottom: 18, marginBottom: 0 }}
    >
      {/* Left: status chips */}
      <div className="flex items-center gap-3 flex-wrap">
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

      {/* Right: sort (grid only) + view toggle */}
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

        {/* View toggle */}
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

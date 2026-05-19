import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useLibraryStore } from './features/library/stores/libraryStore';
import { useLibraryFilters } from './features/library/stores/librarySelectors';
import { AddBookDrawer } from './features/library/components/AddBookDrawer';
import { FilterBar } from './features/library/components/FilterBar';
import { LibraryTable } from './features/library/components/LibraryTable';
import { InsightsPage } from './features/library/components/InsightsPage';

const TAGLINES = [
  'Read like a god.',
  'Every page, a door.',
  'Build your canon.',
  'A life well-shelved.',
  'Words outlast empires.',
  'The shelf never lies.',
  'Know thyself. Read more.',
  'Pages over everything.',
  'Ink runs deep.',
  'One volume at a time.',
];

type Page = 'library' | 'insights';

function getPage(): Page {
  return window.location.hash === '#insights' ? 'insights' : 'library';
}

function NavLink({ label, page, current, onClick }: { label: string; page: Page; current: Page; onClick: (p: Page) => void }) {
  const active = page === current;
  return (
    <a
      href={page === 'insights' ? '#insights' : '#'}
      onClick={(e) => { e.preventDefault(); onClick(page); }}
      className="font-serif text-sm transition-colors"
      style={{
        color: active ? 'var(--color-ink)' : 'var(--color-ink-mute)',
        fontWeight: active ? 500 : 400,
        textDecoration: 'none',
        paddingBottom: 2,
        borderBottom: active ? '1px solid var(--color-ink)' : '1px solid transparent',
      }}
    >
      {label}
    </a>
  );
}

function HeaderSearch() {
  const filters = useLibraryFilters();
  const setFilters = useLibraryStore((s) => s.setFilters);
  const [value, setValue] = useState(filters.search);
  const debounced = useDebounce(value, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounced === filters.search) return;
    setFilters({ search: debounced });
  }, [debounced, filters.search, setFilters]);

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

  return (
    <div className="relative w-full" style={{ maxWidth: 320 }}>
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ paddingLeft: 36, paddingRight: 52 }}
      />
      <kbd
        className="absolute pointer-events-none font-sans text-ink-faint"
        style={{ right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, letterSpacing: '0.02em' }}
      >
        ⌘K
      </kbd>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (p: Page) => {
    window.location.hash = p === 'insights' ? 'insights' : '';
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule-soft bg-cream">
        <div className="grid items-center px-page-x py-5" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

          {/* Left: logo + nav */}
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="flex items-center gap-2"
              style={{ textDecoration: 'none' }}
              onClick={(e) => { e.preventDefault(); navigate('library'); }}
            >
              <Logo size="lg" />
              <div>
                <h1
                  className="font-display font-semibold text-ink leading-none"
                  style={{ fontSize: 22, letterSpacing: '-0.01em' }}
                >
                  Minerva
                </h1>
                <p className="font-serif italic text-ink-mute" style={{ fontSize: 12, marginTop: 2 }}>
                  {tagline}
                </p>
              </div>
            </a>

            <nav className="flex items-center gap-4" style={{ marginLeft: 8 }}>
              <NavLink label="Library" page="library" current={page} onClick={navigate} />
              <NavLink label="Insights" page="insights" current={page} onClick={navigate} />
            </nav>
          </div>

          {/* Center: search (library only) */}
          <div className="flex justify-center">
            {page === 'library' && <HeaderSearch />}
          </div>

          {/* Right: actions */}
          <div className="flex items-center justify-end gap-1">
            <ThemeToggle />
            {page === 'library' && <AddBookDrawer />}
          </div>
        </div>
      </header>

      {page === 'library' ? (
        <main className="px-page-x py-6">
          <FilterBar />
          <LibraryTable />
        </main>
      ) : (
        <InsightsPage />
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;

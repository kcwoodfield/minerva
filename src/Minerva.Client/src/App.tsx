import { useEffect, useState, type MouseEvent } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Toaster } from '@/components/ui/sonner';
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

function pickTagline(exclude?: string) {
  const pool = exclude ? TAGLINES.filter((t) => t !== exclude) : TAGLINES;
  return pool[Math.floor(Math.random() * pool.length)];
}

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

function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [tagline, setTagline] = useState(() => pickTagline());

  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (p: Page) => {
    window.location.hash = p === 'insights' ? 'insights' : '';
    setPage(p);
  };

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '';
    setPage('library');
    window.history.replaceState(null, '', '/');
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule-soft bg-cream">
        <div className="flex items-center justify-between px-page-x py-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <a href="/" onClick={goHome} className="shrink-0" style={{ textDecoration: 'none' }}>
                <Logo size="lg" />
              </a>
              <div>
                <a href="/" onClick={goHome} style={{ textDecoration: 'none' }}>
                  <h1
                    className="font-display font-semibold text-ink leading-none"
                    style={{ fontSize: 22, letterSpacing: '-0.01em' }}
                  >
                    Minerva
                  </h1>
                </a>
                <button
                  type="button"
                  onClick={() => setTagline((prev) => pickTagline(prev))}
                  className="font-serif italic text-ink-mute cursor-pointer text-left transition-colors hover:text-ink"
                  style={{ fontSize: 12, marginTop: 2, background: 'none', border: 'none', padding: 0 }}
                  title="Another thought"
                >
                  {tagline}
                </button>
              </div>
            </div>

            <nav className="flex items-center gap-4" style={{ marginLeft: 8 }}>
              <NavLink label="Library" page="library" current={page} onClick={navigate} />
              <NavLink label="Insights" page="insights" current={page} onClick={navigate} />
            </nav>
          </div>

          <div className="flex items-center gap-1">
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

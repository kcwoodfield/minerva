import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Toaster } from '@/components/ui/sonner';
import { AddBookDrawer } from './features/library/components/AddBookDrawer';
import { FilterBar } from './features/library/components/FilterBar';
import { LibraryTable } from './features/library/components/LibraryTable';
import { InsightsPage } from './features/library/components/InsightsPage';

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
        <div className="flex items-center justify-between px-page-x py-5">
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
                  Read like a god.
                </p>
              </div>
            </a>

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

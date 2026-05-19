import { useEffect, useState, type MouseEvent } from 'react';
import { AppHeader, type AppPage } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/sonner';
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

function getPage(): AppPage {
  return window.location.hash === '#insights' ? 'insights' : 'library';
}

function App() {
  const [page, setPage] = useState<AppPage>(getPage);
  const [tagline, setTagline] = useState(() => pickTagline());

  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (p: AppPage) => {
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
      <AppHeader
        page={page}
        tagline={tagline}
        onNavigate={navigate}
        onGoHome={goHome}
        onTaglineClick={() => setTagline((prev) => pickTagline(prev))}
      />

      {page === 'library' ? (
        <main className="px-4 py-5 md:px-page-x md:py-6">
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

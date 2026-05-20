import { useEffect, useState, type MouseEvent } from 'react';
import { AppHeader, type AppPage } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { FilterBar } from './features/library/components/FilterBar';
import { LibraryTable } from './features/library/components/LibraryTable';
import { InsightsPage } from './features/library/components/InsightsPage';
import { BulkUploadPage } from './features/library/components/BulkUploadPage';

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
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/upload') return 'upload';
  if (window.location.hash === '#insights') return 'insights';
  return 'library';
}

function App() {
  const [page, setPage] = useState<AppPage>(getPage);
  const [tagline, setTagline] = useState(() => pickTagline());

  useEffect(() => {
    const syncPage = () => setPage(getPage());
    window.addEventListener('hashchange', syncPage);
    window.addEventListener('popstate', syncPage);
    return () => {
      window.removeEventListener('hashchange', syncPage);
      window.removeEventListener('popstate', syncPage);
    };
  }, []);

  const navigate = (p: AppPage) => {
    if (p === 'upload') {
      window.history.pushState(null, '', '/upload');
      setPage('upload');
      return;
    }
    if (p === 'insights') {
      window.history.pushState(null, '', '/#insights');
      window.location.hash = 'insights';
      setPage('insights');
      return;
    }
    window.history.pushState(null, '', '/');
    window.location.hash = '';
    setPage('library');
  };

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState(null, '', '/');
    window.location.hash = '';
    setPage('library');
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

      {page === 'library' && (
        <main className="px-4 py-5 md:px-page-x md:py-6">
          <FilterBar />
          <LibraryTable />
        </main>
      )}
      {page === 'insights' && <InsightsPage />}
      {page === 'upload' && <BulkUploadPage />}

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;

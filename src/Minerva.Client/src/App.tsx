import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Toaster } from '@/components/ui/sonner';
import { AddBookDrawer } from './features/library/components/AddBookDrawer';
import { FilterBar } from './features/library/components/FilterBar';
import { LibraryTable } from './features/library/components/LibraryTable';

function LibraryContent() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule-soft bg-cream">
        <div className="flex items-center justify-between px-page-x py-5">
          <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AddBookDrawer />
          </div>
        </div>
      </header>

      <main className="px-page-x py-6">
        <FilterBar />
        <LibraryTable />
      </main>

      <Toaster richColors />
    </div>
  );
}

function App() {
  return <LibraryContent />;
}

export default App;

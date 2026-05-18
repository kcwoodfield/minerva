import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AddBookDrawer } from './features/library/components/AddBookDrawer';
import { FilterBar } from './features/library/components/FilterBar';
import { LibraryTable } from './features/library/components/LibraryTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function LibraryContent() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule-soft bg-cream">
        <div className="flex items-center justify-between px-page-x py-5">
          <div className="flex items-center gap-3">
            <img
              src="/logo.webp"
              alt=""
              width={36}
              height={36}
              className="mix-blend-multiply select-none object-contain"
              style={{ width: 36, height: 36 }}
            />
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
          <AddBookDrawer />
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
  return (
    <QueryClientProvider client={queryClient}>
      <LibraryContent />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;

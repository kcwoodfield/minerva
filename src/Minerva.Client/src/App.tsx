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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Minerva</h1>
              <p className="text-sm text-muted-foreground">A Library Worth the Gods</p>
            </div>
            <AddBookDrawer />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
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

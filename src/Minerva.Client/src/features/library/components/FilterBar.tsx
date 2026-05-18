import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { useLibraryStore } from '../stores/libraryStore';

export function FilterBar() {
  const { filters, setFilters, clearFilters } = useLibraryStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const hasActiveFilters = filters.search || filters.genre || filters.format;

  return (
    <div className="flex gap-2 mb-4 items-center">
      <Input
        placeholder="Search title, author, or ISBN…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-sm"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearchInput(''); }}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

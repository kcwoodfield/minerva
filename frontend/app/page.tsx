'use client';

import { useState, useEffect } from 'react';
import { BooksDataTable } from '@/components/books-data-table';
import { fetchBooks } from '@/lib/api';
import { Book } from '@/types/book';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async (search?: string) => {
    try {
      setIsLoading(true);
      const response = await fetchBooks(search);
      setBooks(response.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadBooks(query);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-6">
        <p className="text-muted-foreground">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-8">
        <BooksDataTable 
          data={books} 
          onSearch={handleSearch} 
        />
      </div>
    </div>
  );
}
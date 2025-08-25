'use client';

import { useState, useEffect } from 'react';
import { BooksDataTable } from '@/components/books-data-table';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { DeleteBookDialog } from '@/components/delete-book-dialog';
import { fetchBooks } from '@/lib/api';
import { Book } from '@/types/book';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: string; title: string } | null>(null);

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

  const handleEdit = (book: Book) => {
    setBookToEdit(book);
    setEditDialogOpen(true);
  };

  const handleDelete = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setBookToDelete({ id: bookId, title: book.title });
      setDeleteDialogOpen(true);
    }
  };

  const handleBookUpdated = () => {
    // Reload books after successful update
    loadBooks(searchQuery);
  };

  const handleBookDeleted = () => {
    // Reload books after successful deletion
    loadBooks(searchQuery);
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      <EditBookDialog
        book={bookToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onBookUpdated={handleBookUpdated}
      />
      
      <DeleteBookDialog
        bookId={bookToDelete?.id || null}
        bookTitle={bookToDelete?.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onBookDeleted={handleBookDeleted}
      />
    </div>
  );
}
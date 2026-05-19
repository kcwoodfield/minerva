import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LibraryState {
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;

  filters: {
    search: string;
    genre?: string;
    format?: string;
    rating?: number;
    status?: 'reading' | 'finished' | 'unread' | null;
    archived?: boolean;
  };
  setFilters: (f: Partial<LibraryState['filters']>) => void;
  clearFilters: () => void;

  sortBy: string;
  ascending: boolean;
  setSort: (sortBy: string, ascending: boolean) => void;
  toggleSort: (sortBy: string) => void;

  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  selectedIds: string[];
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  selectAll: (ids: string[]) => void;

  editingBook: string | null;
  setEditingBook: (id: string | null) => void;

  view: 'list' | 'grid';
  setView: (view: 'list' | 'grid') => void;

  /** Incremented after create/update/delete to refetch the book list. */
  listVersion: number;
  bumpList: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      columnVisibility: {},
      setColumnVisibility: (columnVisibility) => set({ columnVisibility }),

      filters: { search: '' },
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 1 })),
      clearFilters: () => set({ filters: { search: '' }, page: 1 }),

      sortBy: 'dateAdded',
      ascending: false,
      setSort: (sortBy, ascending) => set({ sortBy, ascending, page: 1 }),
      toggleSort: (sortBy) =>
        set((s) => {
          if (s.sortBy === sortBy) {
            return { ascending: !s.ascending, page: 1 };
          }
          const ascending = sortBy === 'title' || sortBy === 'author';
          return { sortBy, ascending, page: 1 };
        }),

      page: 1,
      pageSize: 25,
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),

      selectedIds: [],
      toggleSelected: (id) => set((s) => ({
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((i) => i !== id)
          : [...s.selectedIds, id],
      })),
      clearSelected: () => set({ selectedIds: [] }),
      selectAll: (ids) => set({ selectedIds: ids }),

      editingBook: null,
      setEditingBook: (id) => set({ editingBook: id }),

      view: 'list',
      setView: (view) => set({ view }),

      listVersion: 0,
      bumpList: () => set((s) => ({ listVersion: s.listVersion + 1 })),
    }),
    {
      name: 'minerva-library-store',
      partialize: (s) => ({ columnVisibility: s.columnVisibility, pageSize: s.pageSize, view: s.view }),
    }
  )
);

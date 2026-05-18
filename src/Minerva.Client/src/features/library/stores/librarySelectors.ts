import { useShallow } from 'zustand/react/shallow';
import { useLibraryStore } from './libraryStore';

export const useLibraryFilters = () =>
  useLibraryStore(useShallow((s) => s.filters));

export const useLibrarySort = () =>
  useLibraryStore(useShallow((s) => ({ sortBy: s.sortBy, ascending: s.ascending })));

export const useLibraryPagination = () =>
  useLibraryStore(useShallow((s) => ({ page: s.page, pageSize: s.pageSize })));

export const useLibraryView = () => useLibraryStore((s) => s.view);

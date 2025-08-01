export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  isbn_13?: string;
  isbn_10?: string;
  publisher?: string;
  publication_date?: string;
  genre?: string;
  sub_genre?: string;
  language?: string;
  pages: number;
  format?: string;
  edition?: string;
  summary?: string;
  tags?: string[];
  cover_image_url?: string;
  rating?: number;
  review?: string;
  related_books?: {
    title: string;
    author: string;
    isbn_13: string;
  }[];
  series_info?: string;
  completed: number;
  date_added: string;
}
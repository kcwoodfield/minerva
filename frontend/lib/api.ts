import { Book } from '@/types/book'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/library'

export interface BooksResponse {
  total: number
  items: Book[]
  page: number
  limit: number
  pages: number
}

export async function fetchBooks(search?: string): Promise<BooksResponse> {
  try {
    const url = new URL(API_BASE_URL)
    if (search) {
      url.searchParams.set('search', search)
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching books:', error)
    throw new Error('Failed to fetch books')
  }
}

export async function fetchBook(id: string): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching book:', error)
    throw new Error('Failed to fetch book')
  }
}

export async function createBook(book: Omit<Book, 'id' | 'date_added' | 'timestamp'>): Promise<Book> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating book:', error)
    throw new Error('Failed to create book')
  }
}

export async function updateBook(id: string, book: Partial<Omit<Book, 'id' | 'date_added' | 'timestamp'>>): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating book:', error)
    throw new Error('Failed to update book')
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    throw new Error('Failed to delete book')
  }
}
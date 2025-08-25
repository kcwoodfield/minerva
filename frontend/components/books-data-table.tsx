"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Book } from "@/types/book"

interface BooksDataTableProps {
  data: Book[]
  onSearch?: (query: string) => void
}

export function BooksDataTable({ data, onSearch }: BooksDataTableProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <div className="w-full border border-gray-300 rounded-md bg-white p-4">
      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            onChange={handleSearchChange}
            className="pl-8 bg-white"
          />
        </div>
      </div>
      
      <div className="rounded-md border bg-white overflow-x-auto">
        <table className="w-full table-auto bg-white">
          <thead className="bg-white">
            <tr className="border-b bg-white">
              <th className="text-left p-4 bg-white">Completed</th>
              <th className="text-left p-4 bg-white">Book Title</th>
              <th className="text-left p-4 bg-white">Author</th>
              <th className="text-left p-4 bg-white">Pages</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length > 0 ? (
              data.map((book) => (
                <tr key={book.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={book.completed >= 100}
                        disabled
                        className="h-4 w-4"
                      />
                      {book.completed > 0 && book.completed < 100 && (
                        <span className="text-sm text-muted-foreground">
                          {book.completed}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{book.title}</td>
                  <td className="p-4">{book.author}</td>
                  <td className="p-4 text-right font-mono">{book.pages}</td>
                </tr>
              ))
            ) : (
              <tr className="bg-white">
                <td colSpan={4} className="p-8 text-center text-muted-foreground bg-white">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
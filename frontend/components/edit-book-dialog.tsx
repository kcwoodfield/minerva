"use client"

import * as React from "react"
import { Book } from "@/types/book"
import { updateBook } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditBookDialogProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated: () => void
}

export function EditBookDialog({ book, open, onOpenChange, onBookUpdated }: EditBookDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: '',
    author: '',
    pages: '',
    completed: '',
    isbn_13: '',
    isbn_10: '',
    publisher: '',
    genre: '',
  })

  React.useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        pages: book.pages?.toString() || '',
        completed: book.completed?.toString() || '0',
        isbn_13: book.isbn_13 || '',
        isbn_10: book.isbn_10 || '',
        publisher: book.publisher || '',
        genre: book.genre || '',
      })
    }
  }, [book])

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!book) return

    setIsLoading(true)
    try {
      const updateData = {
        title: formData.title,
        author: formData.author,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        completed: formData.completed ? parseFloat(formData.completed) : 0,
        isbn_13: formData.isbn_13,
        isbn_10: formData.isbn_10,
        publisher: formData.publisher,
        genre: formData.genre,
      }

      await updateBook(book.id, updateData)
      onBookUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update book:', error)
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update the book information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange('title')}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={handleInputChange('author')}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pages" className="text-right">
                Pages
              </Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={handleInputChange('pages')}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="completed" className="text-right">
                Progress %
              </Label>
              <Input
                id="completed"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.completed}
                onChange={handleInputChange('completed')}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre" className="text-right">
                Genre
              </Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={handleInputChange('genre')}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publisher" className="text-right">
                Publisher
              </Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={handleInputChange('publisher')}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isbn_13" className="text-right">
                ISBN-13
              </Label>
              <Input
                id="isbn_13"
                value={formData.isbn_13}
                onChange={handleInputChange('isbn_13')}
                className="col-span-3"
                placeholder="13-digit ISBN"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isbn_10" className="text-right">
                ISBN-10
              </Label>
              <Input
                id="isbn_10"
                value={formData.isbn_10}
                onChange={handleInputChange('isbn_10')}
                className="col-span-3"
                placeholder="10-digit ISBN"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Book'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
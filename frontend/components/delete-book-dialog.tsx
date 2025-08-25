"use client"

import * as React from "react"
import { deleteBook } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteBookDialogProps {
  bookId: string | null
  bookTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookDeleted: () => void
}

export function DeleteBookDialog({ 
  bookId, 
  bookTitle, 
  open, 
  onOpenChange, 
  onBookDeleted 
}: DeleteBookDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDelete = async () => {
    if (!bookId) return

    setIsLoading(true)
    try {
      await deleteBook(bookId)
      onBookDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete book:', error)
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Book</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {bookTitle ? `"${bookTitle}"` : 'this book'}? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
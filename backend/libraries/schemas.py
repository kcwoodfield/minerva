from datetime import datetime
from typing import List, Optional
from ninja import Schema
import uuid


class LibraryEntryBase(Schema):
    # Create -> Data
    # LibraryEntryIn
    title: str
    author: str
    isbn_13: str
    isbn_10: Optional[str] = None
    pages: int
    rating: int = 0
    review: Optional[str] = None
    completed: int = 0  # Changed from bool to int for percentage
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    genre: Optional[str] = None
    sub_genre: Optional[str] = None
    language: Optional[str] = None
    format: Optional[str] = None
    edition: Optional[str] = None
    translator: Optional[str] = None
    summary: Optional[str] = None
    tags: List[str] = []
    cover_image_url: Optional[str] = None


class LibraryEntryCreateSchema(LibraryEntryBase):
    pass


class LibraryEntryUpdateSchema(Schema):
    # Update -> Data
    # LibraryEntryUpdate
    title: Optional[str] = None
    author: Optional[str] = None
    pages: Optional[int] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    isbn_13: Optional[str] = None
    isbn_10: Optional[str] = None
    completed: Optional[int] = None  # Changed from bool to int for percentage
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    genre: Optional[str] = None
    sub_genre: Optional[str] = None
    language: Optional[str] = None
    format: Optional[str] = None
    edition: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None


class LibraryEntryDetailCreateSchema(Schema):
    # Get -> Data
    # LibraryEntryDetailOut
    id: uuid.UUID
    title: str
    author: str
    pages: int
    rating: int
    review: str
    isbn_13: str
    isbn_10: Optional[str] = None
    completed: int  # Changed from bool to int
    timestamp: datetime
    date_added: datetime


class LibraryEntryListSchema(Schema):
    # List -> Data
    # LibraryEntryOut
    id: uuid.UUID
    title: str
    author: str
    pages: int
    rating: int
    review: Optional[str] = None
    isbn_13: str
    isbn_10: Optional[str] = None
    completed: int  # Changed from bool to int
    timestamp: datetime
    date_added: datetime
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    genre: Optional[str] = None
    sub_genre: Optional[str] = None
    language: Optional[str] = None
    format: Optional[str] = None
    edition: Optional[str] = None
    summary: Optional[str] = None
    tags: List[str] = []
    cover_image_url: Optional[str] = None


class PaginatedResponseSchema(Schema):
    items: List[LibraryEntryListSchema]
    total: int
    page: int
    limit: int
    pages: int

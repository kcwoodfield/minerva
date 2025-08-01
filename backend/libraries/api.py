from typing import List, Optional
from django.db.models import Q
from ninja import Router, Query
from ninja.schema import Schema
from ninja.errors import HttpError
from django.core.exceptions import ValidationError

from .models import LibraryEntry
from .schemas import LibraryEntryListSchema, PaginatedResponseSchema, LibraryEntryCreateSchema, LibraryEntryUpdateSchema

router = Router()


@router.get("", response=PaginatedResponseSchema)
def list_library_entries(
    request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("title"),
    order: str = Query("asc"),
    q: Optional[str] = Query(None),
    completed: Optional[str] = Query(None),
):
    """
    Retrieve paginated library entries with sorting and filtering.

    Parameters:
        request (HttpRequest): The HTTP request object.
        page (int): The page number (1-indexed).
        limit (int): The number of entries per page.
        sort (str): The field to sort by (title, author, pages, rating, completed).
        order (str): The sort order (asc or desc).
        q (str, optional): Text to search in title or author.
        completed (str, optional): Filter by completion status (all, 0, or 100).

    Returns:
        dict: A dictionary containing paginated library entries and metadata.
    """
    try:
        # Start with all entries
        qs = LibraryEntry.objects.all()

        # Apply text search if provided
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(author__icontains=q) |
                Q(publisher__icontains=q) |
                Q(genre__icontains=q) |
                Q(sub_genre__icontains=q) |
                Q(summary__icontains=q) |
                Q(tags__contains=[q]) |
                Q(isbn_13__icontains=q) |
                Q(isbn_10__icontains=q)
            )

        # Apply completion filter if provided
        if completed and completed != "all":
            try:
                if completed == "in_progress":
                    qs = qs.filter(completed__gt=0, completed__lt=100)
                else:
                    completion_value = int(completed)
                    qs = qs.filter(completed=completion_value)
            except ValueError:
                # If the value can't be converted to an integer, ignore the filter
                pass

        # Apply sorting
        if order == "desc":
            sort = f"-{sort}"
        qs = qs.order_by(sort)

        # Apply pagination
        offset = (page - 1) * limit
        total = qs.count()
        entries = qs[offset:offset + limit]

        # Convert model instances to dictionaries
        serialized_entries = [
            {
                "id": str(entry.id),
                "title": entry.title,
                "author": entry.author,
                "pages": entry.pages,
                "rating": entry.rating,
                "review": entry.review,
                "isbn_13": entry.isbn_13,
                "isbn_10": entry.isbn_10,
                "completed": entry.completed,
                "timestamp": entry.timestamp,
                "date_added": entry.date_added,
                "publisher": entry.publisher,
                "publication_date": entry.publication_date,
                "genre": entry.genre,
                "sub_genre": entry.sub_genre,
                "language": entry.language,
                "format": entry.format,
                "edition": entry.edition,
                "summary": entry.summary,
                "tags": entry.tags,
                "cover_image_url": entry.cover_image_url
            }
            for entry in entries
        ]

        return {
            "items": serialized_entries,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HttpError(500, f"An error occurred while fetching books: {str(e)}")

@router.post("", response=LibraryEntryListSchema)
def create_library_entry(request, payload: LibraryEntryCreateSchema):
    """
    Create a new library entry.

    Parameters:
        request (HttpRequest): The HTTP request object.
        payload (LibraryEntryCreateSchema): The data for the new library entry.

    Returns:
        LibraryEntryListSchema: The created library entry.
    """
    try:
        # Check if ISBN-13 already exists
        if LibraryEntry.objects.filter(isbn_13=payload.isbn_13).exists():
            raise HttpError(400, f"A book with ISBN-13 {payload.isbn_13} already exists in the library.")

        entry = LibraryEntry.objects.create(
            title=payload.title,
            author=payload.author,
            isbn_13=payload.isbn_13,
            isbn_10=payload.isbn_10,
            pages=payload.pages,
            rating=payload.rating,
            review=payload.review,
            completed=payload.completed,
            publisher=payload.publisher,
            publication_date=payload.publication_date,
            genre=payload.genre,
            sub_genre=payload.sub_genre,
            language=payload.language,
            format=payload.format,
            edition=payload.edition,
            summary=payload.summary,
            tags=payload.tags,
            cover_image_url=payload.cover_image_url
        )

        # Convert the model instance to a dictionary matching LibraryEntryListSchema
        return {
            "id": str(entry.id),
            "title": entry.title,
            "author": entry.author,
            "pages": entry.pages,
            "rating": entry.rating,
            "review": entry.review,
            "isbn_13": entry.isbn_13,
            "isbn_10": entry.isbn_10,
            "completed": entry.completed,
            "timestamp": entry.timestamp,
            "date_added": entry.date_added,
            "publisher": entry.publisher,
            "publication_date": entry.publication_date,
            "genre": entry.genre,
            "sub_genre": entry.sub_genre,
            "language": entry.language,
            "format": entry.format,
            "edition": entry.edition,
            "summary": entry.summary,
            "tags": entry.tags,
            "cover_image_url": entry.cover_image_url
        }
    except ValidationError as e:
        raise HttpError(400, str(e))
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(500, f"An error occurred while creating the book: {str(e)}")

@router.delete("/{book_id}")
def delete_library_entry(request, book_id: str):
    """
    Delete a library entry.

    Parameters:
        request (HttpRequest): The HTTP request object.
        book_id (str): The UUID of the book to delete.

    Returns:
        dict: A success message.
    """
    try:
        entry = LibraryEntry.objects.get(id=book_id)
        entry.delete()
        return {"detail": "Book deleted successfully"}
    except LibraryEntry.DoesNotExist:
        raise HttpError(404, "Book not found")
    except Exception as e:
        raise HttpError(500, f"An error occurred while deleting the book: {str(e)}")

@router.put("/{book_id}", response=LibraryEntryListSchema)
def update_library_entry(request, book_id: str, payload: LibraryEntryUpdateSchema):
    """
    Update a library entry.

    Parameters:
        request (HttpRequest): The HTTP request object.
        book_id (str): The UUID of the book to update.
        payload (LibraryEntryUpdateSchema): The updated data for the library entry.

    Returns:
        LibraryEntryListSchema: The updated library entry.
    """
    try:
        entry = LibraryEntry.objects.get(id=book_id)

        # Update fields if they are provided in the payload
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(entry, field, value)

        entry.save()

        # Convert the model instance to a dictionary matching LibraryEntryListSchema
        return {
            "id": str(entry.id),
            "title": entry.title,
            "author": entry.author,
            "pages": entry.pages,
            "rating": entry.rating,
            "review": entry.review,
            "isbn_13": entry.isbn_13,
            "isbn_10": entry.isbn_10,
            "completed": entry.completed,
            "timestamp": entry.timestamp,
            "date_added": entry.date_added,
            "publisher": entry.publisher,
            "publication_date": entry.publication_date,
            "genre": entry.genre,
            "sub_genre": entry.sub_genre,
            "language": entry.language,
            "format": entry.format,
            "edition": entry.edition,
            "summary": entry.summary,
            "tags": entry.tags,
            "cover_image_url": entry.cover_image_url
        }
    except LibraryEntry.DoesNotExist:
        raise HttpError(404, "Book not found")
    except ValidationError as e:
        raise HttpError(400, str(e))
    except Exception as e:
        raise HttpError(500, f"An error occurred while updating the book: {str(e)}")

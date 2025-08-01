import uuid
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
import logging
from .utils import fetch_book_metadata, search_books_by_title, GoogleBooksAPIError

logger = logging.getLogger(__name__)


# LibraryEntry model for a Book
class LibraryEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    pages = models.PositiveIntegerField()
    rating = models.PositiveSmallIntegerField(default=0)
    review = models.TextField(blank=True, null=True)
    isbn_13 = models.CharField(
        max_length=13,
        validators=[
            RegexValidator(
                regex="^[0-9]{13}$", message="ISBN-13 must be exactly 13 digits"
            )
        ],
        help_text="ISBN-13 format (13 digits)",
        default="0000000000000",  # Temporary default for migration
        unique=True,
    )
    isbn_10 = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex="^[0-9]{10}$", message="ISBN-10 must be exactly 10 digits"
            )
        ],
        help_text="ISBN-10 format (10 digits)",
        blank=True,
        null=True,
    )
    completed = models.PositiveSmallIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)
    date_added = models.DateTimeField(auto_now_add=True)

    # Additional fields
    publisher = models.CharField(max_length=255, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    sub_genre = models.CharField(max_length=100, blank=True, null=True)
    language = models.CharField(max_length=50, blank=True, null=True)
    format = models.CharField(max_length=50, blank=True, null=True)
    edition = models.CharField(max_length=50, blank=True, null=True)
    translator = models.CharField(max_length=100, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Only try to enrich data if this is a new object (no ID yet)
        if not self.pk:
            metadata = None

            # First try ISBN lookup if available
            if self.isbn_13:
                try:
                    metadata = fetch_book_metadata(self.isbn_13)
                except GoogleBooksAPIError as e:
                    logger.warning(f"Error fetching book data by ISBN: {str(e)}")

            # If ISBN lookup failed or no ISBN, try title lookup
            if not metadata and self.title:
                try:
                    results = search_books_by_title(self.title)
                    if results:
                        # Use the first result (most relevant)
                        metadata = results[0]
                        # If we got ISBNs from title search and don't have them, use them
                        if not self.isbn_13 and metadata.get("isbn_13"):
                            self.isbn_13 = metadata["isbn_13"]
                        if not self.isbn_10 and metadata.get("isbn_10"):
                            self.isbn_10 = metadata["isbn_10"]
                except GoogleBooksAPIError as e:
                    logger.warning(f"Error fetching book data by title: {str(e)}")

            # Update blank fields with metadata if available
            if metadata:
                if not self.title and metadata.get("title"):
                    self.title = metadata["title"]

                if not self.author and metadata.get("author"):
                    self.author = metadata["author"]

                if not self.pages and metadata.get("pages"):
                    self.pages = metadata["pages"]

                if not self.publisher and metadata.get("publisher"):
                    self.publisher = metadata["publisher"]

                if not self.publication_date and metadata.get("publication_date"):
                    self.publication_date = metadata["publication_date"]

                if not self.language and metadata.get("language"):
                    self.language = metadata["language"]

                if not self.summary and metadata.get("summary"):
                    self.summary = metadata["summary"]

                if not self.cover_image_url and metadata.get("cover_image_url"):
                    self.cover_image_url = metadata["cover_image_url"]

                # Add categories as tags if they exist and tags is empty
                if not self.tags and metadata.get("categories"):
                    self.tags = metadata["categories"]

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Library Entry"
        verbose_name_plural = "Library Entries"

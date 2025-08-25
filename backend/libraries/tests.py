"""
Tests for the libraries app.
"""

from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from unittest.mock import patch, Mock
import json
from uuid import uuid4

from .models import LibraryEntry
from .utils import fetch_book_metadata


class LibraryEntryModelTest(TestCase):
    """Test the LibraryEntry model."""
    
    def setUp(self):
        """Set up test data."""
        self.valid_book_data = {
            'title': 'Test Book',
            'author': 'Test Author',
            'pages': 300,
            'isbn_13': '9781234567890',
            'isbn_10': '1234567890',
            'publisher': 'Test Publisher',
            'genre': 'Fiction',
            'completed': 0
        }
    
    def test_create_book_with_valid_data(self):
        """Test creating a book with valid data."""
        book = LibraryEntry.objects.create(**self.valid_book_data)
        
        self.assertEqual(book.title, 'Test Book')
        self.assertEqual(book.author, 'Test Author')
        self.assertEqual(book.pages, 300)
        self.assertEqual(book.isbn_13, '9781234567890')
        self.assertEqual(book.completed, 0)
        self.assertIsNotNone(book.id)
        self.assertIsNotNone(book.date_added)
        self.assertIsNotNone(book.timestamp)
    
    def test_isbn_13_validation(self):
        """Test ISBN-13 validation."""
        # Test invalid ISBN-13 (too short)
        invalid_data = self.valid_book_data.copy()
        invalid_data['isbn_13'] = '123456789'
        
        with self.assertRaises(ValidationError):
            book = LibraryEntry(**invalid_data)
            book.full_clean()
    
    def test_isbn_10_validation(self):
        """Test ISBN-10 validation."""
        # Test invalid ISBN-10 (too long)
        invalid_data = self.valid_book_data.copy()
        invalid_data['isbn_10'] = '12345678901'
        
        with self.assertRaises(ValidationError):
            book = LibraryEntry(**invalid_data)
            book.full_clean()
    
    def test_isbn_13_uniqueness(self):
        """Test that ISBN-13 must be unique."""
        LibraryEntry.objects.create(**self.valid_book_data)
        
        # Try to create another book with same ISBN-13
        duplicate_data = self.valid_book_data.copy()
        duplicate_data['title'] = 'Different Title'
        
        with self.assertRaises(IntegrityError):
            LibraryEntry.objects.create(**duplicate_data)
    
    def test_completed_percentage_bounds(self):
        """Test completed percentage validation."""
        # Test that valid completion values work
        valid_data = self.valid_book_data.copy()
        valid_data['completed'] = 50
        valid_data['isbn_13'] = '9781234567891'  # Different ISBN to avoid uniqueness constraint
        
        book = LibraryEntry.objects.create(**valid_data)
        self.assertEqual(book.completed, 50)
        
        # Test that 100% completion works
        valid_data['completed'] = 100
        valid_data['isbn_13'] = '9781234567892'  # Different ISBN
        
        book2 = LibraryEntry.objects.create(**valid_data)
        self.assertEqual(book2.completed, 100)
    
    def test_str_method(self):
        """Test the string representation of the model."""
        book = LibraryEntry.objects.create(**self.valid_book_data)
        self.assertEqual(str(book), book.title)


class LibraryAPITest(TestCase):
    """Test the library API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.valid_book_data = {
            'title': 'API Test Book',
            'author': 'API Test Author',
            'pages': 250,
            'isbn_13': '9781111111111',
            'publisher': 'API Publisher',
            'genre': 'Technology',
            'completed': 25
        }
        
        self.book = LibraryEntry.objects.create(**self.valid_book_data)
    
    def test_get_books_list(self):
        """Test GET /api/library/ endpoint."""
        response = self.client.get('/api/library/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn('items', data)
        self.assertIn('total', data)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['title'], 'API Test Book')
    
    def test_get_book_detail(self):
        """Test GET /api/library/{id} endpoint."""
        response = self.client.get(f'/api/library/{self.book.id}')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['title'], 'API Test Book')
        self.assertEqual(data['author'], 'API Test Author')
        self.assertEqual(data['completed'], 25)
    
    def test_get_nonexistent_book(self):
        """Test GET request for non-existent book."""
        fake_id = uuid4()
        response = self.client.get(f'/api/library/{fake_id}')
        
        self.assertEqual(response.status_code, 404)
    
    @patch('libraries.utils.fetch_book_metadata')
    def test_create_book(self, mock_fetch):
        """Test POST /api/library/ endpoint."""
        mock_fetch.return_value = None  # Skip Google Books enrichment
        
        new_book_data = {
            'title': 'New Book',
            'author': 'New Author',
            'pages': 200,
            'isbn_13': '9782222222222',
        }
        
        response = self.client.post(
            '/api/library/',
            data=json.dumps(new_book_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        self.assertEqual(data['title'], 'New Book')
        self.assertEqual(data['author'], 'New Author')
        self.assertIn('id', data)
        
        # Verify book was created in database
        book = LibraryEntry.objects.get(id=data['id'])
        self.assertEqual(book.title, 'New Book')
    
    def test_update_book(self):
        """Test PUT /api/library/{id} endpoint."""
        update_data = {
            'title': 'Updated Title',
            'completed': 50
        }
        
        response = self.client.put(
            f'/api/library/{self.book.id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data['title'], 'Updated Title')
        self.assertEqual(data['completed'], 50)
        self.assertEqual(data['author'], 'API Test Author')  # Unchanged field
        
        # Verify database was updated
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, 'Updated Title')
        self.assertEqual(self.book.completed, 50)
    
    def test_delete_book(self):
        """Test DELETE /api/library/{id} endpoint."""
        book_id = self.book.id
        
        response = self.client.delete(f'/api/library/{book_id}')
        
        self.assertEqual(response.status_code, 204)
        
        # Verify book was deleted
        with self.assertRaises(LibraryEntry.DoesNotExist):
            LibraryEntry.objects.get(id=book_id)
    
    def test_search_books(self):
        """Test search functionality."""
        # Create another book
        LibraryEntry.objects.create(
            title='Python Programming',
            author='Python Author',
            pages=400,
            isbn_13='9783333333333'
        )
        
        # Search by title
        response = self.client.get('/api/library/?search=Python')
        data = response.json()
        
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['title'], 'Python Programming')
        
        # Search by author
        response = self.client.get('/api/library/?search=API Test Author')
        data = response.json()
        
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['author'], 'API Test Author')


class GoogleBooksUtilsTest(TransactionTestCase):
    """Test Google Books API integration utilities."""
    
    def setUp(self):
        """Set up test data."""
        self.book = LibraryEntry.objects.create(
            title='Test Book',
            author='Test Author',
            isbn_13='9781234567890'
        )
    
    @patch('libraries.utils.requests.get')
    def test_google_books_enrichment_success(self, mock_get):
        """Test successful Google Books API enrichment."""
        # Mock Google Books API response
        mock_response = Mock()
        mock_response.json.return_value = {
            'items': [{
                'volumeInfo': {
                    'title': 'Enriched Title',
                    'authors': ['Enriched Author'],
                    'publisher': 'Enriched Publisher',
                    'pageCount': 500,
                    'categories': ['Fiction'],
                    'description': 'A great book',
                    'imageLinks': {
                        'thumbnail': 'http://example.com/cover.jpg'
                    }
                }
            }]
        }
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Mock and call fetch function
        metadata = fetch_book_metadata(self.book.isbn_13)
        if metadata:
            for field, value in metadata.items():
                if value and hasattr(self.book, field):
                    setattr(self.book, field, value)
            self.book.save()
        
        # Refresh book from database
        self.book.refresh_from_db()
        
        # Verify enrichment occurred
        self.assertEqual(self.book.publisher, 'Enriched Publisher')
        self.assertEqual(self.book.pages, 500)
        self.assertEqual(self.book.genre, 'Fiction')
        self.assertEqual(self.book.cover_image_url, 'http://example.com/cover.jpg')
    
    @patch('libraries.utils.requests.get')
    def test_google_books_enrichment_failure(self, mock_get):
        """Test handling of Google Books API failure."""
        # Mock failed API response
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        original_title = self.book.title
        
        # Mock and call fetch function
        metadata = fetch_book_metadata(self.book.isbn_13)
        if metadata:
            for field, value in metadata.items():
                if value and hasattr(self.book, field):
                    setattr(self.book, field, value)
            self.book.save()
        
        # Refresh book from database
        self.book.refresh_from_db()
        
        # Verify book data unchanged on API failure
        self.assertEqual(self.book.title, original_title)
    
    @patch('libraries.utils.requests.get')
    def test_google_books_no_results(self, mock_get):
        """Test handling when Google Books returns no results."""
        # Mock empty API response
        mock_response = Mock()
        mock_response.json.return_value = {'items': []}
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        original_title = self.book.title
        
        # Mock and call fetch function
        metadata = fetch_book_metadata(self.book.isbn_13)
        if metadata:
            for field, value in metadata.items():
                if value and hasattr(self.book, field):
                    setattr(self.book, field, value)
            self.book.save()
        
        # Refresh book from database
        self.book.refresh_from_db()
        
        # Verify book data unchanged when no results
        self.assertEqual(self.book.title, original_title)


class IntegrationTest(TransactionTestCase):
    """Integration tests for complete workflows."""
    
    @patch('libraries.utils.fetch_book_metadata')
    def test_complete_book_lifecycle(self, mock_fetch):
        """Test complete CRUD lifecycle for a book."""
        mock_fetch.return_value = None
        
        # 1. Create book
        create_data = {
            'title': 'Lifecycle Book',
            'author': 'Lifecycle Author',
            'isbn_13': '9784444444444',
            'pages': 350
        }
        
        response = self.client.post(
            '/api/library/',
            data=json.dumps(create_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        book_data = response.json()
        book_id = book_data['id']
        
        # 2. Read book
        response = self.client.get(f'/api/library/{book_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], 'Lifecycle Book')
        
        # 3. Update book
        update_data = {
            'completed': 75.0,
            'genre': 'Science Fiction'
        }
        
        response = self.client.put(
            f'/api/library/{book_id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        updated_data = response.json()
        self.assertEqual(updated_data['completed'], 75.0)
        self.assertEqual(updated_data['genre'], 'Science Fiction')
        
        # 4. Delete book
        response = self.client.delete(f'/api/library/{book_id}')
        self.assertEqual(response.status_code, 204)
        
        # 5. Verify deletion
        response = self.client.get(f'/api/library/{book_id}')
        self.assertEqual(response.status_code, 404)
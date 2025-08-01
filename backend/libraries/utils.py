import requests
from typing import Optional, Dict, Any, List
from datetime import datetime

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"


class GoogleBooksAPIError(Exception):
    """Custom exception for Google Books API errors"""

    pass


def process_volume_info(volume_info: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to process volume info from Google Books API response"""
    metadata = {
        "title": volume_info.get("title"),
        "author": volume_info.get("authors", [None])[0],  # Get first author or None
        "publisher": volume_info.get("publisher"),
        "publication_date": volume_info.get("publishedDate"),
        "pages": volume_info.get("pageCount"),
        "language": volume_info.get("language"),
        "summary": volume_info.get("description"),
        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
        "categories": volume_info.get("categories", []),
        "isbn_13": None,
        "isbn_10": None,
    }

    # Extract ISBNs if available
    industry_identifiers = volume_info.get("industryIdentifiers", [])
    for identifier in industry_identifiers:
        if identifier["type"] == "ISBN_13":
            metadata["isbn_13"] = identifier["identifier"]
        elif identifier["type"] == "ISBN_10":
            metadata["isbn_10"] = identifier["identifier"]

    # Convert publication_date to proper format if it exists
    if metadata["publication_date"]:
        try:
            # Try parsing full date
            date_obj = datetime.strptime(metadata["publication_date"], "%Y-%m-%d")
        except ValueError:
            try:
                # Try parsing just year-month
                date_obj = datetime.strptime(metadata["publication_date"], "%Y-%m")
            except ValueError:
                try:
                    # Try parsing just year
                    date_obj = datetime.strptime(metadata["publication_date"], "%Y")
                except ValueError:
                    # If all parsing attempts fail, set to None
                    metadata["publication_date"] = None
                else:
                    metadata["publication_date"] = date_obj.date()
            else:
                metadata["publication_date"] = date_obj.date()
        else:
            metadata["publication_date"] = date_obj.date()

    return metadata


def fetch_book_metadata(isbn: str) -> Optional[Dict[str, Any]]:
    """
    Fetch book metadata from Google Books API using ISBN.

    Args:
        isbn (str): ISBN-13 or ISBN-10 of the book

    Returns:
        Optional[Dict[str, Any]]: Processed book metadata or None if not found

    Raises:
        GoogleBooksAPIError: If there's an error calling the API
    """
    try:
        # Remove any hyphens from ISBN
        clean_isbn = isbn.replace("-", "")

        # Make the API request
        response = requests.get(
            GOOGLE_BOOKS_API_URL, params={"q": f"isbn:{clean_isbn}"}, timeout=10
        )
        response.raise_for_status()

        data = response.json()

        # Check if we got any results
        if not data.get("items"):
            return None

        # Get the first result's volume info
        volume_info = data["items"][0]["volumeInfo"]
        return process_volume_info(volume_info)

    except requests.RequestException as e:
        raise GoogleBooksAPIError(
            f"Error fetching data from Google Books API: {str(e)}"
        )
    except (KeyError, IndexError) as e:
        raise GoogleBooksAPIError(
            f"Error processing Google Books API response: {str(e)}"
        )
    except Exception as e:
        raise GoogleBooksAPIError(
            f"Unexpected error while fetching book metadata: {str(e)}"
        )


def search_books_by_title(title: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search for books by title using Google Books API.

    Args:
        title (str): Book title to search for
        max_results (int): Maximum number of results to return

    Returns:
        List[Dict[str, Any]]: List of processed book metadata

    Raises:
        GoogleBooksAPIError: If there's an error calling the API
    """
    try:
        # Make the API request
        response = requests.get(
            GOOGLE_BOOKS_API_URL,
            params={
                "q": f"intitle:{title}",
                "maxResults": max_results,
                "orderBy": "relevance",
            },
            timeout=10,
        )
        response.raise_for_status()

        data = response.json()

        # Check if we got any results
        if not data.get("items"):
            return []

        # Process all results
        results = []
        for item in data["items"]:
            volume_info = item["volumeInfo"]
            metadata = process_volume_info(volume_info)
            results.append(metadata)

        return results

    except requests.RequestException as e:
        raise GoogleBooksAPIError(
            f"Error fetching data from Google Books API: {str(e)}"
        )
    except (KeyError, IndexError) as e:
        raise GoogleBooksAPIError(
            f"Error processing Google Books API response: {str(e)}"
        )
    except Exception as e:
        raise GoogleBooksAPIError(f"Unexpected error while searching books: {str(e)}")

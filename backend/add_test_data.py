import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'minervahome.settings')
django.setup()

from libraries.models import LibraryEntry

# Create some sample books
LibraryEntry.objects.create(
    title="The Great Gatsby",
    author="F. Scott Fitzgerald",
    pages=180,
    rating=5,
    review="A classic American novel about the Jazz Age",
    isbn_13="9780743273565",
    isbn_10="0743273567",
    completed=True
)

LibraryEntry.objects.create(
    title="1984",
    author="George Orwell",
    pages=328,
    rating=4,
    review="A dystopian social science fiction novel",
    isbn_13="9780451524935",
    isbn_10="0451524934",
    completed=True
)

LibraryEntry.objects.create(
    title="To Kill a Mockingbird",
    author="Harper Lee",
    pages=281,
    rating=5,
    review="A classic of modern American literature",
    isbn_13="9780446310789",
    isbn_10="0446310786",
    completed=False
)

# New books
LibraryEntry.objects.create(
    title="War and Peace",
    author="Leo Tolstoy",
    pages=1225,
    rating=5,
    review="A masterpiece of Russian literature, chronicling the French invasion of Russia and its impact on five aristocratic families",
    isbn_13="9780140447934",
    isbn_10="0140447938",
    completed=False
)

LibraryEntry.objects.create(
    title="Sexual Personae",
    author="Camille Paglia",
    pages=736,
    rating=4,
    review="A controversial and influential work of cultural criticism examining art and literature through the lens of gender and sexuality",
    isbn_13="9780300061165",
    isbn_10="0300061161",
    completed=False
)

LibraryEntry.objects.create(
    title="Cloud Atlas",
    author="David Mitchell",
    pages=544,
    rating=5,
    review="An innovative novel that weaves together six different stories spanning different time periods and genres",
    isbn_13="9780375507250",
    isbn_10="0375507256",
    completed=False
)

LibraryEntry.objects.create(
    title="The Brothers Karamazov",
    author="Fyodor Dostoevsky",
    pages=796,
    rating=5,
    review="A philosophical novel that explores themes of faith, doubt, and morality through the story of a family",
    isbn_13="9780374528379",
    isbn_10="0374528373",
    completed=False
)

LibraryEntry.objects.create(
    title="The Stranger",
    author="Albert Camus",
    pages=123,
    rating=4,
    review="A philosophical novel exploring themes of absurdism and existentialism through the story of Meursault",
    isbn_13="9780679720201",
    isbn_10="0679720200",
    completed=False
)

LibraryEntry.objects.create(
    title="Down and Out in Paris and London",
    author="George Orwell",
    pages=213,
    rating=4,
    review="A memoir of poverty and working-class life in two great cities",
    isbn_13="9780156262248",
    isbn_10="0156262248",
    completed=False
)

# Additional books
LibraryEntry.objects.create(
    title="Middlemarch",
    author="George Eliot",
    pages=904,
    rating=5,
    review="A masterpiece of Victorian literature, exploring themes of marriage, politics, and social reform in a provincial English town",
    isbn_13="9780141439549",
    isbn_10="0141439548",
    completed=False
)

LibraryEntry.objects.create(
    title="To the Lighthouse",
    author="Virginia Woolf",
    pages=209,
    rating=5,
    review="A modernist masterpiece exploring the nature of consciousness and the passage of time through the Ramsay family's summer holiday",
    isbn_13="9780156907392",
    isbn_10="0156907399",
    completed=False
)

LibraryEntry.objects.create(
    title="Leaves of Grass",
    author="Walt Whitman",
    pages=624,
    rating=5,
    review="A groundbreaking collection of poetry celebrating democracy, nature, love, and friendship",
    isbn_13="9780140421996",
    isbn_10="0140421995",
    completed=False
)

LibraryEntry.objects.create(
    title="The Story of Art",
    author="E.H. Gombrich",
    pages=688,
    rating=5,
    review="A comprehensive and accessible introduction to the history of art, from prehistoric times to the modern era",
    isbn_13="9780714892069",
    isbn_10="0714892061",
    completed=False
)

LibraryEntry.objects.create(
    title="The White Album",
    author="Joan Didion",
    pages=222,
    rating=5,
    review="A collection of essays capturing the cultural and political upheavals of the 1960s and 1970s",
    isbn_13="9780374532079",
    isbn_10="0374532079",
    completed=False
)

print("Test data added successfully!")
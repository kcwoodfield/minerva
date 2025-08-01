from django.db import migrations

def update_existing_books(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')

    # Update "East of Eden"
    try:
        book = LibraryEntry.objects.get(isbn_13='9780140186390')
        book.publisher = 'Penguin Classics'
        book.publication_date = None
        book.genre = None
        book.sub_genre = None
        book.language = None
        book.format = None
        book.edition = None
        book.summary = None
        book.tags = []
        book.cover_image_url = None
        book.save()
    except LibraryEntry.DoesNotExist:
        pass

    # Update "A Farewell to Arms"
    try:
        book = LibraryEntry.objects.get(isbn_13='9780684801469')
        book.publisher = 'Scribner'
        book.publication_date = None
        book.genre = None
        book.sub_genre = None
        book.language = None
        book.format = None
        book.edition = None
        book.summary = None
        book.tags = []
        book.cover_image_url = None
        book.save()
    except LibraryEntry.DoesNotExist:
        pass

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0011_alter_libraryentry_author_and_more'),
    ]

    operations = [
        migrations.RunPython(update_existing_books),
    ]
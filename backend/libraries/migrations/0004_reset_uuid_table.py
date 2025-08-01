from django.db import migrations
import uuid

def reset_table(apps, schema_editor):
    # Get the model
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')

    # Get all existing data
    entries = list(LibraryEntry.objects.all().values(
        'title', 'author', 'pages', 'rating', 'review',
        'isbn_13', 'isbn_10', 'completed', 'timestamp'
    ))

    # Drop all existing data
    LibraryEntry.objects.all().delete()

    # Recreate entries with new UUIDs
    for entry in entries:
        LibraryEntry.objects.create(
            id=uuid.uuid4(),
            **entry
        )

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0003_alter_libraryentry_id'),
    ]

    operations = [
        migrations.RunPython(reset_table),
    ]
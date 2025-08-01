from django.db import migrations
from django.db.models import Max

def remove_duplicates(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')

    # Get all entries grouped by title and author
    duplicates = LibraryEntry.objects.values('title', 'author').annotate(
        max_timestamp=Max('timestamp')
    ).values('title', 'author', 'max_timestamp')

    # For each group of duplicates, keep the most recent entry
    for dup in duplicates:
        # Get all entries with this title and author
        entries = LibraryEntry.objects.filter(
            title=dup['title'],
            author=dup['author']
        )

        # Keep the most recent entry, delete others
        entries.exclude(timestamp=dup['max_timestamp']).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0004_reset_uuid_table'),
    ]

    operations = [
        migrations.RunPython(remove_duplicates),
    ]
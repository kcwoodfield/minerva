from django.db import migrations, models
from django.utils import timezone

def populate_date_added(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')
    # Set date_added to timestamp for existing entries
    for entry in LibraryEntry.objects.all():
        entry.date_added = entry.timestamp
        entry.save()

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0007_add_hemingway'),
    ]

    operations = [
        migrations.AddField(
            model_name='LibraryEntry',
            name='date_added',
            field=models.DateTimeField(default=timezone.now),
        ),
        migrations.RunPython(populate_date_added),
    ]
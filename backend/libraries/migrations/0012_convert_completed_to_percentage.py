from django.db import migrations, models

def convert_completed_to_percentage(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')
    for entry in LibraryEntry.objects.all():
        # Convert boolean to percentage (0 or 100)
        entry.completed = 100 if entry.completed else 0
        entry.save()

class Migration(migrations.Migration):

    dependencies = [
        ('libraries', '0011_alter_libraryentry_author_and_more'),
    ]

    operations = [
        migrations.RunPython(convert_completed_to_percentage),
        migrations.AlterField(
            model_name='libraryentry',
            name='completed',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]
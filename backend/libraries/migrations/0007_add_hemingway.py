from django.db import migrations

def add_hemingway_books(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')

    books = [
        {
            'title': 'The Old Man and the Sea',
            'author': 'Ernest Hemingway',
            'pages': 127,
            'rating': 5,
            'review': 'A classic tale of an aging fisherman\'s struggle with a giant marlin, exploring themes of perseverance and dignity.',
            'isbn_13': '9780684801223',
            'isbn_10': '0684801221',
            'completed': False
        },
        {
            'title': 'For Whom the Bell Tolls',
            'author': 'Ernest Hemingway',
            'pages': 480,
            'rating': 5,
            'review': 'A powerful novel set during the Spanish Civil War, exploring themes of love, war, and sacrifice.',
            'isbn_13': '9780684803357',
            'isbn_10': '0684803356',
            'completed': False
        },
        {
            'title': 'A Farewell to Arms',
            'author': 'Ernest Hemingway',
            'pages': 332,
            'rating': 5,
            'review': 'A tragic love story set against the backdrop of World War I, showcasing Hemingway\'s distinctive style.',
            'isbn_13': '9780684801469',
            'isbn_10': '0684801469',
            'completed': False
        },
        {
            'title': 'The Sun Also Rises',
            'author': 'Ernest Hemingway',
            'pages': 251,
            'rating': 5,
            'review': 'A defining novel of the Lost Generation, following a group of expatriates in post-World War I Europe.',
            'isbn_13': '9780743297332',
            'isbn_10': '0743297334',
            'completed': False
        },
        {
            'title': 'To Have and Have Not',
            'author': 'Ernest Hemingway',
            'pages': 262,
            'rating': 4,
            'review': 'A novel about a fishing boat captain in Key West during the Great Depression, exploring themes of survival and morality.',
            'isbn_13': '9780684821375',
            'isbn_10': '0684821370',
            'completed': False
        },
        {
            'title': 'The Garden of Eden',
            'author': 'Ernest Hemingway',
            'pages': 247,
            'rating': 4,
            'review': 'A posthumously published novel exploring themes of gender, identity, and artistic creation.',
            'isbn_13': '9780684804529',
            'isbn_10': '0684804527',
            'completed': False
        },
        {
            'title': 'Islands in the Stream',
            'author': 'Ernest Hemingway',
            'pages': 448,
            'rating': 4,
            'review': 'A posthumously published novel following an artist\'s life in the Caribbean and his experiences during World War II.',
            'isbn_13': '9780684804543',
            'isbn_10': '0684804543',
            'completed': False
        },
        {
            'title': 'Across the River and Into the Trees',
            'author': 'Ernest Hemingway',
            'pages': 320,
            'rating': 4,
            'review': 'A novel about an aging American colonel in Venice, reflecting on war, love, and mortality.',
            'isbn_13': '9780684801443',
            'isbn_10': '0684801447',
            'completed': False
        },
        {
            'title': 'The Torrents of Spring',
            'author': 'Ernest Hemingway',
            'pages': 128,
            'rating': 3,
            'review': 'A satirical novella parodying the style of Sherwood Anderson and other writers of the time.',
            'isbn_13': '9780684801450',
            'isbn_10': '0684801455',
            'completed': False
        }
    ]

    for book in books:
        LibraryEntry.objects.create(**book)

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0006_add_books'),
    ]

    operations = [
        migrations.RunPython(add_hemingway_books),
    ]
from django.db import migrations

def add_books(apps, schema_editor):
    LibraryEntry = apps.get_model('libraries', 'LibraryEntry')

    books = [
        {
            'title': 'East of Eden',
            'author': 'John Steinbeck',
            'pages': 601,
            'rating': 5,
            'review': 'A masterpiece of American literature, exploring themes of good and evil through the story of two families in California\'s Salinas Valley.',
            'isbn_13': '9780140186390',
            'isbn_10': '0140186395',
            'completed': False
        },
        {
            'title': 'My Struggle',
            'author': 'Karl Ove Knausgård',
            'pages': 432,
            'rating': 4,
            'review': 'The first volume of Knausgård\'s six-volume autobiographical novel, exploring memory, death, and the nature of writing.',
            'isbn_13': '9780374534141',
            'isbn_10': '0374534145',
            'completed': False
        },
        {
            'title': 'Hamlet',
            'author': 'William Shakespeare',
            'pages': 342,
            'rating': 5,
            'review': 'One of Shakespeare\'s greatest tragedies, exploring themes of revenge, madness, and mortality.',
            'isbn_13': '9780143128544',
            'isbn_10': '0143128546',
            'completed': False
        },
        {
            'title': 'King Lear',
            'author': 'William Shakespeare',
            'pages': 384,
            'rating': 5,
            'review': 'A powerful tragedy about aging, power, and the relationship between parents and children.',
            'isbn_13': '9780143128728',
            'isbn_10': '0143128724',
            'completed': False
        },
        {
            'title': 'The Snow Leopard',
            'author': 'Peter Matthiessen',
            'pages': 352,
            'rating': 4,
            'review': 'A beautiful account of a journey to the Himalayas, combining natural history, spiritual quest, and personal memoir.',
            'isbn_13': '9780143105514',
            'isbn_10': '0143105516',
            'completed': False
        },
        {
            'title': 'Life and Fate',
            'author': 'Vasily Grossman',
            'pages': 896,
            'rating': 5,
            'review': 'A monumental novel about the Battle of Stalingrad and the Soviet experience during World War II.',
            'isbn_13': '9781590172018',
            'isbn_10': '1590172019',
            'completed': False
        },
        {
            'title': 'Kafka on the Shore',
            'author': 'Haruki Murakami',
            'pages': 467,
            'rating': 4,
            'review': 'A mesmerizing novel that combines magical realism with a coming-of-age story.',
            'isbn_13': '9781400079278',
            'isbn_10': '1400079276',
            'completed': False
        }
    ]

    for book in books:
        LibraryEntry.objects.create(**book)

class Migration(migrations.Migration):
    dependencies = [
        ('libraries', '0005_remove_duplicates'),
    ]

    operations = [
        migrations.RunPython(add_books),
    ]
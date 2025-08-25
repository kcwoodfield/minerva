"""
WSGI config for minervahome project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'minervahome.settings')
application = get_wsgi_application()
import os
from django.core.wsgi import get_wsgi_application

# Set the default Django settings module for the 'SwipeX' project.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Get the WSGI application callable to handle standard synchronous requests.
application = get_wsgi_application()
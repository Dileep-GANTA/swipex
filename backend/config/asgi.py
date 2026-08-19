import os
from django.core.asgi import get_asgi_application

# Set the default Django settings module for the 'SwipeX' project.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Get the ASGI application callable to handle asynchronous requests.
application = get_asgi_application()
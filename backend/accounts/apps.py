from django.apps import AppConfig

class AccountsConfig(AppConfig):
    # Set the default auto field type for auto-incrementing primary keys
    default_auto_field = 'django.db.models.BigAutoField'
    
    # Define the full module path to the application
    name = 'accounts'
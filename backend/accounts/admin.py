from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'is_staff', 'created_at')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)

admin.site.register(CustomUser, CustomUserAdmin)
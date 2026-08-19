from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """Allow object owners to edit their own information."""

    def has_object_permission(self, request, view, obj):
        if request.method in BasePermission.SAFE_METHODS:
            return True
        return obj == request.user

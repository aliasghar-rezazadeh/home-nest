
from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "user",
        "role",
        "created_at",
    ]

    list_filter = [
        "role",
        "created_at",
    ]

    search_fields = [
        "user__username",
        "user__email",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

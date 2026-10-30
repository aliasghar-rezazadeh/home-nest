
from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import Profile


class IsAdminRole(BasePermission):
    """
    فقط کاربرانی که نقش admin دارند اجازه دسترسی دارند.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return Profile.objects.filter(
            user=request.user,
            role=Profile.Role.ADMIN
        ).exists()


class IsAdminRoleOrReadOnly(BasePermission):
    """
    همه می‌توانند اطلاعات را مشاهده کنند؛
    اما تغییر اطلاعات فقط برای مدیر مجاز است.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return IsAdminRole().has_permission(request, view)

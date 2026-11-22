# from core.permissions import IsAdminRoleOrReadOnly

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsReviewOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):

        # همه کاربران اجازه مشاهده نظر را دارند
        if request.method in SAFE_METHODS:
            return True

        # فقط صاحب نظر اجازه ویرایش یا حذف دارد
        return (
            request.user
            and request.user.is_authenticated
            and obj.user_id == request.user.id
        )
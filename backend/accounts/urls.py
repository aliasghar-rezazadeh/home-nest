from django.urls import path
from .views import RegisterView, UserProfileView, AdminDashboardView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("admin-dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
]
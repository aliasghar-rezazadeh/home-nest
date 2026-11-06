
from django.urls import path

from .views import (
    CreateOrderView,
    OrderHistoryView,
    OrderDetailView,
    OrderStatusUpdateView,
    CancelOwnOrderView,
    AdminOrderListView,
)

urlpatterns = [
    path("create/", CreateOrderView.as_view(), name="order-create"),
    path("", OrderHistoryView.as_view(), name="order-history"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path(
        "<int:pk>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-status-update"
    ),
    path(
        "<int:pk>/cancel/",
        CancelOwnOrderView.as_view(),
        name="order-cancel"
    ),
    path("admin/", AdminOrderListView.as_view(), name="admin-order-list"),
]

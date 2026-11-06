
from django.urls import path

from .views import (
    WishlistView,
    AddWishlistItemView,
    ToggleWishlistItemView,
    RemoveWishlistItemView,
)

urlpatterns = [
    path("", WishlistView.as_view(), name="wishlist"),

    path(
        "items/",
        AddWishlistItemView.as_view(),
        name="wishlist-add-item"
    ),

    path(
        "toggle/",
        ToggleWishlistItemView.as_view(),
        name="wishlist-toggle"
    ),

    path(
        "items/<int:pk>/",
        RemoveWishlistItemView.as_view(),
        name="wishlist-remove-item"
    ),
]

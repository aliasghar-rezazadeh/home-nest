from django.urls import path

from .views import (
    ProductListView,
    ProductDetailView,
    CategoryListView,
    CategoryDetailView,
    ProductReviewListCreateView,
    ProductReviewDetailView,
)


urlpatterns = [
    path(
        "products/",
        ProductListView.as_view(),
        name="product-list"
    ),

    path(
        "products/<int:product_id>/reviews/",
        ProductReviewListCreateView.as_view(),
        name="product-review-list-create"
    ),

    path(
        "products/<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail"
    ),

    path(
        "reviews/<int:pk>/",
        ProductReviewDetailView.as_view(),
        name="product-review-detail"
    ),

    path(
        "categories/",
        CategoryListView.as_view(),
        name="category-list"
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail"
    ),
]

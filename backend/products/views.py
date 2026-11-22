from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Count

from .models import Product, Category, ProductReview
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ProductReviewSerializer,
)
from .filters import ProductFilter
from .pagination import CategoryPagination
from .permissions import IsReviewOwnerOrReadOnly
from core.permissions import IsAdminRoleOrReadOnly

class ProductListView(generics.ListCreateAPIView):

    serializer_class = ProductSerializer
    filterset_class = ProductFilter

    search_fields = [
        "name",
        "description",
        "sku",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "name",
        "stock",
    ]

    ordering = ["-created_at"]

    permission_classes = [IsAdminRoleOrReadOnly]

    def get_queryset(self):

        return (
            Product.objects
            .select_related("category")
            .prefetch_related(
                "tags",
                "variants",
                "reviews__user",
                "images",
                "specifications",
                "content_blocks",
            )
        )


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ProductSerializer

    permission_classes = [IsAdminRoleOrReadOnly]

    def get_queryset(self):

        return (
            Product.objects
            .select_related("category")
            .prefetch_related(
                "tags",
                "variants",
                "reviews__user",
                "images",
                "specifications",
                "content_blocks",
            )
        )




class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.annotate(
        products_count=Count("products")
    )
    serializer_class = CategorySerializer
    permission_classes = [IsAdminRoleOrReadOnly]
    pagination_class = CategoryPagination


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Category.objects.annotate(
        products_count=Count("products")
    )

    serializer_class = CategorySerializer

    permission_classes = [IsAdminRoleOrReadOnly]


class ProductReviewListCreateView(generics.ListCreateAPIView):

    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_product(self):
        return get_object_or_404(
            Product,
            pk=self.kwargs["product_id"]
        )

    def get_queryset(self):

        product = self.get_product()

        return (
            ProductReview.objects
            .filter(product=product)
            .select_related("user")
        )

    def perform_create(self, serializer):

        product = self.get_product()

        # جلوگیری از ثبت نظر تکراری توسط یک کاربر
        existing_review = ProductReview.objects.filter(
            product=product,
            user=self.request.user
        ).exists()

        if existing_review:
            raise ValidationError({
                "detail": (
                    "You have already reviewed this product. "
                    "You can edit your existing review."
                )
            })

        serializer.save(
            product=product,
            user=self.request.user
        )


class ProductReviewDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ProductReviewSerializer

    permission_classes = [
        IsReviewOwnerOrReadOnly
    ]

    queryset = (
        ProductReview.objects
        .select_related("user", "product")
    )
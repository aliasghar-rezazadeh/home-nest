
from rest_framework import generics

from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .filters import ProductFilter

from core.permissions import IsAdminRoleOrReadOnly


class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_class = ProductFilter

    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name", "stock"]
    ordering = ["-created_at"]

    permission_classes = [IsAdminRoleOrReadOnly]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    permission_classes = [IsAdminRoleOrReadOnly]


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    permission_classes = [IsAdminRoleOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    permission_classes = [IsAdminRoleOrReadOnly]

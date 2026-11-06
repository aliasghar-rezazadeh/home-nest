
from django.db import transaction
from django.db.models import F

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddCartItemSerializer,
    UpdateCartItemSerializer,
)

from products.models import Product, ProductVariant


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart


class AddCartItemView(generics.GenericAPIView):
    serializer_class = AddCartItemSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        variant = serializer.validated_data.get("variant")

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.select_for_update().get(pk=cart.pk)

        product = Product.objects.select_for_update().get(pk=product.pk)

        if product.variants.exists():
            if variant is None:
                raise ValidationError({
                    "variant_id": "لطفاً تنوع محصول را انتخاب کنید."
                })

            variant = ProductVariant.objects.select_for_update().get(
                pk=variant.pk,
                product=product,
            )
            available_stock = variant.stock
        else:
            if variant is not None:
                raise ValidationError({
                    "variant_id": "این محصول تنوعی ندارد."
                })

            available_stock = product.stock

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={"quantity": 1},
        )

        new_quantity = 1 if created else cart_item.quantity + 1

        if new_quantity > available_stock:
            raise ValidationError("موجودی کافی نیست.")

        if not created:
            cart_item.quantity = new_quantity
            cart_item.save(update_fields=["quantity", "updated_at"])

        return Response(
            {
                "message": "محصول به سبد خرید اضافه شد.",
                "cart_item": {
                    "id": cart_item.id,
                    "product_id": product.id,
                    "variant_id": variant.id if variant else None,
                    "quantity": cart_item.quantity,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class UpdateCartItemView(generics.GenericAPIView):
    serializer_class = UpdateCartItemSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        cart_item = generics.get_object_or_404(
            CartItem.objects.select_related("product", "variant", "cart"),
            pk=pk,
            cart__user=request.user,
        )

        serializer = self.get_serializer(
            data=request.data,
            context={"cart_item": cart_item},
        )
        serializer.is_valid(raise_exception=True)

        cart_item.quantity = serializer.validated_data["quantity"]
        cart_item.save(update_fields=["quantity", "updated_at"])

        return Response({
            "message": "تعداد محصول به‌روزرسانی شد.",
            "quantity": cart_item.quantity,
        })


class RemoveCartItemView(generics.DestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

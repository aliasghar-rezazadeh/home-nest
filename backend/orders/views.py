
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminRole
from cart.models import Cart, CartItem
from products.models import Product, ProductVariant

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    UpdateOrderStatusSerializer,
    AdminOrderSerializer,
)


def restore_order_inventory(order_items):
    """
    Restore inventory to the exact product or variant
    originally purchased.
    """
    product_ids = sorted({
        item.product_id for item in order_items
    })

    products = list(
        Product.objects.select_for_update()
        .filter(id__in=product_ids)
        .order_by("id")
    )

    products_by_id = {
        product.id: product for product in products
    }

    variant_ids = sorted({
        item.variant_id
        for item in order_items
        if item.variant_id is not None
    })

    variants = list(
        ProductVariant.objects.select_for_update()
        .filter(id__in=variant_ids)
        .order_by("id")
    )

    variants_by_id = {
        variant.id: variant for variant in variants
    }

    for item in order_items:
        if item.variant_id:
            variant = variants_by_id.get(item.variant_id)

            if variant is None:
                raise APIException(
                    "تنوع یکی از محصولات سفارش پیدا نشد."
                )

            ProductVariant.objects.filter(
                id=variant.id
            ).update(
                stock=F("stock") + item.quantity
            )

        else:
            product = products_by_id.get(item.product_id)

            if product is None:
                raise APIException(
                    "یکی از محصولات سفارش پیدا نشد."
                )

            Product.objects.filter(
                id=product.id
            ).update(
                stock=F("stock") + item.quantity
            )


class CreateOrderView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def post(self, request):
        with transaction.atomic():
            try:
                cart = Cart.objects.select_for_update().get(
                    user=request.user
                )
            except Cart.DoesNotExist:
                return Response(
                    {"error": "سبد خرید شما خالی است."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_items = list(
                CartItem.objects.select_for_update()
                .filter(cart=cart)
                .select_related("product", "variant")
                .order_by("product_id", "variant_id", "id")
            )

            if not cart_items:
                return Response(
                    {"error": "سبد خرید شما خالی است."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            product_ids = sorted({
                item.product_id for item in cart_items
            })

            products = list(
                Product.objects.select_for_update()
                .filter(id__in=product_ids)
                .order_by("id")
            )

            products_by_id = {
                product.id: product for product in products
            }

            variant_ids = sorted({
                item.variant_id
                for item in cart_items
                if item.variant_id is not None
            })

            variants = list(
                ProductVariant.objects.select_for_update()
                .filter(id__in=variant_ids)
                .order_by("id")
            )

            variants_by_id = {
                variant.id: variant for variant in variants
            }

            total_price = 0
            order_items = []
            inventory_updates = []

            for cart_item in cart_items:
                product = products_by_id.get(
                    cart_item.product_id
                )

                if product is None:
                    return Response(
                        {"error": "یکی از محصولات سبد خرید پیدا نشد."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                has_variants = product.variants.exists()

                if has_variants:
                    if cart_item.variant_id is None:
                        return Response(
                            {
                                "error": (
                                    f"لطفاً تنوع محصول {product.name} "
                                    "را دوباره انتخاب کنید."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    variant = variants_by_id.get(
                        cart_item.variant_id
                    )

                    if (
                        variant is None
                        or variant.product_id != product.id
                    ):
                        return Response(
                            {"error": "تنوع انتخاب‌شده معتبر نیست."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    if cart_item.quantity > variant.stock:
                        return Response(
                            {
                                "error": (
                                    f"موجودی تنوع انتخاب‌شده از "
                                    f"محصول {product.name} کافی نیست."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    selected_variant = variant
                    variant_color = variant.color
                    variant_size = variant.size

                else:
                    if cart_item.variant_id is not None:
                        return Response(
                            {
                                "error": (
                                    f"محصول {product.name} دیگر تنوع ندارد."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    if cart_item.quantity > product.stock:
                        return Response(
                            {
                                "error": (
                                    f"موجودی محصول {product.name} کافی نیست."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    selected_variant = None
                    variant_color = ""
                    variant_size = ""

                current_price = product.price
                total_price += current_price * cart_item.quantity

                order_items.append(
                    OrderItem(
                        product=product,
                        variant=selected_variant,
                        product_name=product.name,
                        variant_color=variant_color,
                        variant_size=variant_size,
                        price=current_price,
                        quantity=cart_item.quantity,
                    )
                )

                inventory_updates.append(
                    (product, selected_variant, cart_item.quantity)
                )

            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
            )

            for item in order_items:
                item.order = order

            OrderItem.objects.bulk_create(order_items)

            for product, variant, quantity in inventory_updates:
                if variant is not None:
                    updated_rows = ProductVariant.objects.filter(
                        id=variant.id,
                        stock__gte=quantity,
                    ).update(
                        stock=F("stock") - quantity
                    )
                else:
                    updated_rows = Product.objects.filter(
                        id=product.id,
                        stock__gte=quantity,
                    ).update(
                        stock=F("stock") - quantity
                    )

                if updated_rows != 1:
                    raise APIException(
                        "موجودی محصول تغییر کرده است. لطفاً دوباره تلاش کنید."
                    )

            CartItem.objects.filter(cart=cart).delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at", "-id")
        )


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
        )


class OrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = UpdateOrderStatusSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["patch", "options"]

    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            order = generics.get_object_or_404(
                self.get_queryset().select_for_update(),
                pk=kwargs["pk"],
            )

            serializer = self.get_serializer(
                order,
                data=request.data,
                partial=True,
            )
            serializer.is_valid(raise_exception=True)

            new_status = serializer.validated_data.get("status")

            if new_status == Order.Status.CANCELLED:
                order_items = list(
                    OrderItem.objects
                    .filter(order=order)
                    .order_by("product_id", "variant_id", "id")
                )

                restore_order_inventory(order_items)

            serializer.save()

        return Response(serializer.data)


class CancelOwnOrderView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def post(self, request, pk):
        with transaction.atomic():
            order = get_object_or_404(
                Order.objects.select_for_update(),
                pk=pk,
                user=request.user,
            )

            if order.status != Order.Status.PENDING:
                return Response(
                    {
                        "error": (
                            "فقط سفارش‌های پرداخت‌نشده قابل لغو هستند."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order_items = list(
                OrderItem.objects
                .filter(order=order)
                .order_by("product_id", "variant_id", "id")
            )

            restore_order_inventory(order_items)

            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "سفارش با موفقیت لغو شد.",
                "order": OrderSerializer(order).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        queryset = (
            Order.objects
            .select_related("user")
            .prefetch_related("items")
            .order_by("-created_at", "-id")
        )

        order_status = self.request.query_params.get("status")

        if order_status:
            allowed_statuses = Order.Status.values

            if order_status not in allowed_statuses:
                raise ValidationError({
                    "status": "وضعیت سفارش معتبر نیست."
                })

            queryset = queryset.filter(status=order_status)

        return queryset

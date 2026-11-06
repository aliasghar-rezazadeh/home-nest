
from decimal import Decimal

from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product, ProductVariant
from products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "variant",
            "quantity",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "total_price",
        ]

    def get_variant(self, obj):
        if not obj.variant:
            return None

        return {
            "id": obj.variant.id,
            "color": obj.variant.color,
            "size": obj.variant.size,
            "stock": obj.variant.stock,
        }

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "total_price",
        ]

    def get_total_price(self, obj):
        return sum(
            (
                item.product.price * item.quantity
                for item in obj.items.all()
            ),
            Decimal("0.00"),
        )


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
    )

    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.select_related("product"),
        source="variant",
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        product = attrs["product"]
        variant = attrs.get("variant")

        has_variants = product.variants.exists()

        if has_variants:
            if variant is None:
                raise serializers.ValidationError({
                    "variant_id": "لطفاً رنگ و سایز موردنظر را انتخاب کنید."
                })

            if variant.product_id != product.id:
                raise serializers.ValidationError({
                    "variant_id": "این تنوع متعلق به محصول انتخاب‌شده نیست."
                })

            if variant.stock < 1:
                raise serializers.ValidationError(
                    "این تنوع در انبار موجود نیست."
                )

        else:
            if variant is not None:
                raise serializers.ValidationError({
                    "variant_id": "این محصول تنوعی ندارد."
                })

            if product.stock < 1:
                raise serializers.ValidationError(
                    "این محصول در انبار موجود نیست."
                )

        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "تعداد باید حداقل ۱ باشد.",
            "invalid": "تعداد باید یک عدد صحیح باشد.",
        },
    )

    def validate_quantity(self, value):
        cart_item = self.context["cart_item"]

        if cart_item.variant_id:
            available_stock = cart_item.variant.stock
        else:
            available_stock = cart_item.product.stock

        if value > available_stock:
            raise serializers.ValidationError("موجودی کافی نیست.")

        return value

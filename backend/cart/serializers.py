from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductSerializer
from decimal import Decimal

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
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
            Decimal("0.00")
        )

class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product"
    )

    def validate_product(self, product):
        if product.stock < 1:
            raise serializers.ValidationError(
                "این محصول در انبار موجود نیست."
            )

        return product


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "تعداد محصول باید حداقل یک باشد.",
            "invalid": "تعداد محصول باید یک عدد صحیح باشد.",
            "required": "تعداد محصول الزامی است.",
        }
    )

    def validate_quantity(self, value):
        cart_item = self.context["cart_item"]

        if value > cart_item.product.stock:
            raise serializers.ValidationError(
                "موجودی کافی نیست."
            )

        return value
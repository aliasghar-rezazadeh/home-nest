from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "quantity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

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
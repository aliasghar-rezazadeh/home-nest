
from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    total_price = serializers.ReadOnlyField()

    variant = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "variant",
            "variant_color",
            "variant_size",
            "price",
            "quantity",
            "total_price",
        ]

        read_only_fields = fields

    def get_variant(self, obj):
        if not obj.variant_id:
            return None

        return {
            "id": obj.variant_id,
            "color": obj.variant_color,
            "size": obj.variant_size,
        }


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "items",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields


class UpdateOrderStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = ["status"]

    def validate_status(self, value):
        allowed_transitions = {
            Order.Status.PENDING: [
                Order.Status.PAID,
                Order.Status.CANCELLED,
            ],
            Order.Status.PAID: [
                Order.Status.PROCESSING,
            ],
            Order.Status.PROCESSING: [
                Order.Status.SHIPPED,
            ],
            Order.Status.SHIPPED: [
                Order.Status.DELIVERED,
            ],
            Order.Status.DELIVERED: [],
            Order.Status.CANCELLED: [],
        }

        current_status = self.instance.status

        if value not in allowed_transitions[current_status]:
            raise serializers.ValidationError(
                "تغییر وضعیت سفارش به این حالت مجاز نیست."
            )

        return value


class AdminOrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "username",
            "items",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

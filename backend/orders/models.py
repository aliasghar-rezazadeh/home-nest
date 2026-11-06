
from django.db import models
from django.contrib.auth.models import User

from products.models import Product, ProductVariant


class Order(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        PAID = "paid", "پرداخت شده"
        PROCESSING = "processing", "در حال پردازش"
        SHIPPED = "shipped", "ارسال شده"
        DELIVERED = "delivered", "تحویل داده شده"
        CANCELLED = "cancelled", "لغو شده"

    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items"
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
        null=True,
        blank=True,
    )

    product_name = models.CharField(max_length=200)

    variant_color = models.CharField(
        max_length=100,
        blank=True
    )

    variant_size = models.CharField(
        max_length=100,
        blank=True
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product_name} - {self.quantity}"

    @property
    def total_price(self):
        return self.price * self.quantity

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductTag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )
    description = models.TextField()
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    stock = models.PositiveIntegerField(default=0)

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        null=True,
        blank=True
    )

    tags = models.ManyToManyField(
        ProductTag,
        related_name="products",
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        result = self.reviews.aggregate(
            average=models.Avg("rating")
        )
        return result["average"] or 0

    @property
    def reviews_count(self):
        return self.reviews.count()


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    color = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=100, blank=True)

    stock = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "color", "size"],
                name="unique_product_variant"
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.color} - {self.size}"


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_reviews"
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "user"],
                name="unique_user_product_review"
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.product.name}"


class ProductImage(models.Model):
    class ImageType(models.TextChoices):
        GALLERY = "gallery", "تصویر گالری"
        DESCRIPTION = "description", "تصویر توضیحات"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(upload_to="products/images/")

    image_type = models.CharField(
        max_length=20,
        choices=ImageType.choices,
        default=ImageType.GALLERY
    )

    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} - {self.image_type}"


class ProductSpecification(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="specifications"
    )

    key = models.CharField(max_length=150)
    value = models.CharField(max_length=255)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.key}: {self.value}"


class ProductContentBlock(models.Model):

    class BlockType(models.TextChoices):
        TEXT = "text", "متن"
        IMAGE = "image", "تصویر"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="content_blocks"
    )

    block_type = models.CharField(
        max_length=10,
        choices=BlockType.choices
    )

    text = models.TextField(
        blank=True
    )

    image = models.ImageField(
        upload_to="products/content/",
        blank=True,
        null=True
    )

    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} - {self.block_type}"



from rest_framework import serializers

from .models import (
    Product,
    Category,
    ProductTag,
    ProductVariant,
    ProductReview,
    ProductImage,
    ProductSpecification,
    ProductContentBlock,
)


class CategorySerializer(serializers.ModelSerializer):

    products_count = serializers.IntegerField(
        read_only=True,
        default=0
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "image",
            "products_count",
            "description",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "products_count",
            "created_at",
        ]


class ProductTagSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductTag
        fields = [
            "id",
            "name",
        ]

        read_only_fields = [
            "id",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "color",
            "size",
            "stock",
        ]

        read_only_fields = [
            "id",
        ]


class ProductReviewSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField(read_only=True)

    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview

        fields = [
            "id",
            "user",
            "is_mine",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "is_mine",
            "created_at",
            "updated_at",
        ]

    def get_is_mine(self, obj):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.user_id == request.user.id

    def validate_comment(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "متن نظر نمی‌تواند خالی باشد."
            )

        return value


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "image_type",
            "order",
        ]

        read_only_fields = [
            "id",
        ]


class ProductSpecificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSpecification
        fields = [
            "id",
            "key",
            "value",
            "order",
        ]

        read_only_fields = [
            "id",
        ]


class ProductContentBlockSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductContentBlock
        fields = [
            "id",
            "block_type",
            "text",
            "image",
            "order",
        ]

        read_only_fields = [
            "id",
        ]


class ProductSerializer(serializers.ModelSerializer):

    # Product name validation
    name = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "نام محصول نمی‌تواند خالی باشد."
        }
    )

    # Product description validation
    description = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "توضیحات محصول نمی‌تواند خالی باشد."
        }
    )

    # Stock validation
    stock = serializers.IntegerField(
        min_value=0,
        error_messages={
            "min_value": "موجودی محصول نمی‌تواند منفی باشد."
        }
    )

    # Optional SKU
    sku = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True
    )

    # Final price (read only)
    final_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    # Category information
    category = CategorySerializer(read_only=True)

    # Category ID for create/update
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )

    # Product tags
    tags = ProductTagSerializer(
        many=True,
        read_only=True
    )

    # Tag IDs for create/update
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProductTag.objects.all(),
        source="tags",
        many=True,
        write_only=True,
        required=False
    )

    # Product variants
    variants = ProductVariantSerializer(
        many=True,
        read_only=True
    )

    # Product reviews
    reviews = ProductReviewSerializer(
        many=True,
        read_only=True
    )

    # Secondary product images
    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    # Product specifications
    specifications = ProductSpecificationSerializer(
        many=True,
        read_only=True
    )

    # Product content blocks
    content_blocks = ProductContentBlockSerializer(
        many=True,
        read_only=True
    )

    # Average rating
    average_rating = serializers.FloatField(read_only=True)

    # Number of reviews
    reviews_count = serializers.IntegerField(read_only=True)

    # Name validation
    def validate_name(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "نام محصول نمی‌تواند خالی باشد."
            )

        return value.strip()

    # Description validation
    def validate_description(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        return value

    # Price validation
    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "قیمت محصول باید بیشتر از صفر باشد."
            )

        return value

    # SKU validation
    def validate_sku(self, value):

        if value is None or not value.strip():
            return None

        return value.strip()

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "sku",
            "description",
            "price",
            "discount_percentage",
            "final_price",
            "is_featured",
            "stock",
            "image",
            "category",
            "category_id",
            "tags",
            "tag_ids",
            "variants",
            "reviews",
            "average_rating",
            "reviews_count",
            "images",
            "specifications",
            "content_blocks",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

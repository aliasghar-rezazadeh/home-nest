
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

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "created_at",
        ]

        read_only_fields = [
            "id",
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

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "user",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]


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

    # اعتبارسنجی نام محصول
    name = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "نام محصول نمی‌تواند خالی باشد."
        }
    )

    # اعتبارسنجی توضیحات
    description = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "توضیحات محصول نمی‌تواند خالی باشد."
        }
    )

    # اعتبارسنجی موجودی
    stock = serializers.IntegerField(
        min_value=0,
        error_messages={
            "min_value": "موجودی محصول نمی‌تواند منفی باشد."
        }
    )

    # SKU اختیاری
    sku = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True
    )

    # نمایش اطلاعات دسته‌بندی
    category = CategorySerializer(read_only=True)

    # دریافت شناسه دسته‌بندی
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )

    # نمایش برچسب‌ها
    tags = ProductTagSerializer(
        many=True,
        read_only=True
    )

    # دریافت شناسه برچسب‌ها
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProductTag.objects.all(),
        source="tags",
        many=True,
        write_only=True,
        required=False
    )

    # نمایش تنوع‌های محصول
    variants = ProductVariantSerializer(
        many=True,
        read_only=True
    )

    # نمایش نظرات کاربران
    reviews = ProductReviewSerializer(
        many=True,
        read_only=True
    )

    # نمایش تصاویر محصول
    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    # نمایش مشخصات محصول
    specifications = ProductSpecificationSerializer(
        many=True,
        read_only=True
    )

    # نمایش محتوای ترکیبی توضیحات
    content_blocks = ProductContentBlockSerializer(
        many=True,
        read_only=True
    )

    # میانگین امتیاز محاسبه‌شده از نظرات
    average_rating = serializers.FloatField(read_only=True)

    # تعداد نظرات
    reviews_count = serializers.IntegerField(read_only=True)

    # اعتبارسنجی نام
    def validate_name(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "نام محصول نمی‌تواند خالی باشد."
            )

        return value.strip()

    # اعتبارسنجی توضیحات
    def validate_description(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        return value

    # اعتبارسنجی قیمت
    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "قیمت محصول باید بیشتر از صفر باشد."
            )

        return value

    # اعتبارسنجی SKU
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

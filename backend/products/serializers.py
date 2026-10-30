
from rest_framework import serializers
from .models import Product, Category


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


class ProductSerializer(serializers.ModelSerializer):

    # اعتبارسنجی موجودی محصول
    name = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "نام محصول نمی‌تواند خالی باشد."
        }
    )
    description = serializers.CharField(
        allow_blank=True,
        error_messages={
            "blank": "توضیحات محصول نمی‌تواند خالی باشد."
        }
    )
    stock = serializers.IntegerField(
        min_value=0,
        error_messages={
            "min_value": "موجودی محصول نمی‌تواند منفی باشد."
        }
    )
    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "توضیحات محصول نمی‌تواند خالی باشد."
            )

        return value


    # نمایش اطلاعات کامل دسته‌بندی هنگام دریافت محصول
    category = CategorySerializer(read_only=True)

    # دریافت شناسه دسته‌بندی هنگام ثبت یا ویرایش محصول
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True
    )

    # اعتبارسنجی قیمت محصول
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "قیمت محصول باید بیشتر از صفر باشد."
            )

        return value

    # اعتبارسنجی نام محصول
    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "نام محصول نمی‌تواند خالی باشد."
            )

        return value

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "image",
            "category",
            "category_id",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

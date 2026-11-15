
from django.contrib import admin
from .models import (
    Product,
    Category,
    ProductTag,
    ProductImage,
    ProductVariant,
    ProductSpecification,
    ProductContentBlock,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "products_count",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    readonly_fields = (
        "products_count",
        "created_at",
    )

    fields = (
        "name",
        "description",
        "image",
        "products_count",
        "created_at",
    )

    def products_count(self, obj):
        return obj.products.count()

    products_count.short_description = "تعداد محصولات"


# مدیریت تگ‌ها
@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):

    list_display = ("id", "name")
    search_fields = ("name",)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = (
        "image",
        "image_type",
        "order",
    )


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 0


class ProductContentBlockInline(admin.TabularInline):
    model = ProductContentBlock
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "price",
        "discount_percentage",
        "final_price_display",
        "is_featured",
        "stock",
        "category",
        "created_at",
    )

    list_filter = (
        "is_featured",
        "category",
        "created_at",
    )

    search_fields = (
        "name",
        "sku",
    )

    list_editable = (
        "discount_percentage",
        "is_featured",
    )

    # انتخاب چند تگ برای محصول
    filter_horizontal = ("tags",)

    inlines = [
        ProductImageInline,
        ProductVariantInline,
        ProductSpecificationInline,
        ProductContentBlockInline,
    ]

    @admin.display(description="قیمت نهایی")
    def final_price_display(self, obj):
        return obj.final_price


from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from rest_framework.test import APIClient

from products.models import Product, ProductVariant
from .models import Cart, CartItem


class CartAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="cart_test_user",
            password="test-password-123",
        )

        self.other_user = User.objects.create_user(
            username="other_cart_user",
            password="test-password-123",
        )

        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            name="Test Product",
            description="Test description",
            price=Decimal("1000000.00"),
            stock=5,
        )

        self.product_with_variants = Product.objects.create(
            name="Variant Product",
            description="Product with variants",
            price=Decimal("2000000.00"),
            stock=0,
        )

        self.red_variant = ProductVariant.objects.create(
            product=self.product_with_variants,
            color="قرمز",
            size="M",
            stock=3,
        )

        self.blue_variant = ProductVariant.objects.create(
            product=self.product_with_variants,
            color="آبی",
            size="L",
            stock=2,
        )

        self.other_product = Product.objects.create(
            name="Other Product",
            description="Another product",
            price=Decimal("500000.00"),
            stock=5,
        )

        self.other_variant = ProductVariant.objects.create(
            product=self.other_product,
            color="سبز",
            size="S",
            stock=5,
        )

    def test_add_product_without_variant(self):
        response = self.client.post(
            "/api/cart/items/",
            {"product_id": self.product.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            CartItem.objects.get(product=self.product).quantity,
            1,
        )

    def test_add_product_with_variants_requires_variant(self):
        response = self.client.post(
            "/api/cart/items/",
            {"product_id": self.product_with_variants.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            CartItem.objects.filter(
                product=self.product_with_variants
            ).exists()
        )

    def test_add_valid_variant(self):
        response = self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "variant_id": self.red_variant.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        item = CartItem.objects.get(
            product=self.product_with_variants,
            variant=self.red_variant,
        )

        self.assertEqual(item.quantity, 1)

    def test_variant_must_belong_to_selected_product(self):
        response = self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "variant_id": self.other_variant.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_cannot_add_out_of_stock_variant(self):
        self.red_variant.stock = 0
        self.red_variant.save()

        response = self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "variant_id": self.red_variant.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_add_same_variant_increases_quantity(self):
        payload = {
            "product_id": self.product_with_variants.id,
            "variant_id": self.red_variant.id,
        }

        self.client.post("/api/cart/items/", payload, format="json")
        self.client.post("/api/cart/items/", payload, format="json")

        item = CartItem.objects.get(
            product=self.product_with_variants,
            variant=self.red_variant,
        )

        self.assertEqual(item.quantity, 2)

    def test_different_variants_create_separate_items(self):
        self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "variant_id": self.red_variant.id,
            },
            format="json",
        )

        self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "variant_id": self.blue_variant.id,
            },
            format="json",
        )

        self.assertEqual(
            CartItem.objects.filter(
                product=self.product_with_variants
            ).count(),
            2,
        )

    def test_cannot_add_more_than_variant_stock(self):
        payload = {
            "product_id": self.product_with_variants.id,
            "variant_id": self.red_variant.id,
        }

        for _ in range(3):
            self.client.post(
                "/api/cart/items/",
                payload,
                format="json",
            )

        response = self.client.post(
            "/api/cart/items/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        item = CartItem.objects.get(
            product=self.product_with_variants,
            variant=self.red_variant,
        )

        self.assertEqual(item.quantity, 3)

    def test_cart_total_uses_product_price(self):
        self.client.post(
            "/api/cart/items/",
            {"product_id": self.product.id},
            format="json",
        )

        response = self.client.get("/api/cart/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Decimal(str(response.data["total_price"])),
            self.product.price,
        )

    def test_update_cart_item_quantity(self):
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 3},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        item.refresh_from_db()
        self.assertEqual(item.quantity, 3)

    def test_cannot_update_quantity_above_stock(self):
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 6},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_remove_cart_item(self):
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.delete(
            f"/api/cart/items/{item.id}/remove/"
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            CartItem.objects.filter(id=item.id).exists()
        )

    def test_user_cannot_update_another_users_cart_item(self):
        other_cart = Cart.objects.create(user=self.other_user)

        item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_user_cannot_remove_another_users_cart_item(self):
        other_cart = Cart.objects.create(user=self.other_user)

        item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.delete(
            f"/api/cart/items/{item.id}/remove/"
        )

        self.assertEqual(response.status_code, 404)

    def test_unauthenticated_user_cannot_access_cart(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/cart/")

        self.assertEqual(response.status_code, 401)

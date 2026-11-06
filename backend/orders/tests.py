
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from rest_framework.test import APIClient

from accounts.models import Profile

from products.models import Product, ProductVariant
from cart.models import Cart, CartItem
from orders.models import Order


class CreateOrderTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create regular user
        self.user = User.objects.create_user(
            username="order_test_user",
            password="TestPassword123!"
        )

        self.client.force_authenticate(user=self.user)

        # Create admin user
        self.admin_user = User.objects.create_user(
            username="order_admin",
            password="TestPassword123!"
        )

        self.admin_user.profile.role = Profile.Role.ADMIN
        self.admin_user.profile.save()

        # Create product
        self.product = Product.objects.create(
            name="Test Product",
            description="Product for order testing",
            price=Decimal("1000000"),
            stock=2
        )

        # Create cart
        self.cart = Cart.objects.create(user=self.user)

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3
        )

    # Order Creation Tests

    def test_order_fails_when_stock_is_insufficient(self):
        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 400)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            1
        )

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            0
        )

    def test_order_is_created_successfully(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=2)

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 201)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            0
        )

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            1
        )

        order = Order.objects.get(user=self.user)

        self.assertEqual(
            order.total_price,
            Decimal("2000000")
        )

        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().quantity, 2)

    def test_order_saves_price_snapshot(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(user=self.user)
        order_item = order.items.first()

        self.assertEqual(
            order_item.price,
            Decimal("1000000")
        )

        self.product.price = Decimal("1500000")
        self.product.save()

        order_item.refresh_from_db()
        order.refresh_from_db()

        self.assertEqual(
            order_item.price,
            Decimal("1000000")
        )

        self.assertEqual(
            order.total_price,
            Decimal("1000000")
        )

    def test_order_fails_when_cart_is_empty(self):
        CartItem.objects.filter(cart=self.cart).delete()

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 400)

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            0
        )

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_unauthenticated_user_cannot_create_order(self):
        self.client.force_authenticate(user=None)

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 401)

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            0
        )

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            1
        )

    def test_new_order_has_pending_status(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(user=self.user)

        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(response.data["status"], "pending")

    # Order History Tests

    def test_user_can_view_own_order_history(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        self.client.post("/api/orders/create/")

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1
        )

        self.client.post("/api/orders/create/")

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(len(response.data["results"]), 2)

        self.assertEqual(
            len(response.data["results"][0]["items"]),
            1
        )

        self.assertEqual(
            len(response.data["results"][1]["items"]),
            1
        )

        self.assertGreater(
            response.data["results"][0]["id"],
            response.data["results"][1]["id"]
        )

    def test_user_can_only_see_own_orders(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        self.client.post("/api/orders/create/")

        second_user = User.objects.create_user(
            username="second_order_user",
            password="TestPassword123!"
        )

        second_cart = Cart.objects.create(user=second_user)

        CartItem.objects.create(
            cart=second_cart,
            product=self.product,
            quantity=1
        )

        self.client.force_authenticate(user=second_user)
        self.client.post("/api/orders/create/")

        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

        self.assertEqual(
            response.data["results"][0]["id"],
            Order.objects.get(user=self.user).id
        )

    # Order Detail Tests

    def test_user_can_view_own_order_detail(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        response = self.client.get(
            f"/api/orders/{order_id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], order_id)
        self.assertEqual(len(response.data["items"]), 1)

    def test_user_cannot_view_other_users_order_detail(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        self.client.post("/api/orders/create/")

        second_user = User.objects.create_user(
            username="second_detail_user",
            password="TestPassword123!"
        )

        self.client.force_authenticate(user=second_user)

        order = Order.objects.get(user=self.user)

        response = self.client.get(
            f"/api/orders/{order.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_unauthenticated_user_cannot_view_order_detail(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        self.client.post("/api/orders/create/")

        order = Order.objects.get(user=self.user)

        self.client.force_authenticate(user=None)

        response = self.client.get(
            f"/api/orders/{order.id}/"
        )

        self.assertEqual(response.status_code, 401)

    # Order Status Tests

    def test_admin_can_update_order_status(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "paid"},
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "paid")

        order = Order.objects.get(id=order_id)

        self.assertEqual(order.status, Order.Status.PAID)

    def test_cancelling_order_restores_product_stock(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "cancelled"},
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "cancelled")

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_cancelling_order_twice_does_not_restore_stock_twice(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.client.force_authenticate(user=self.admin_user)

        first_response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "cancelled"},
            format="json"
        )

        self.assertEqual(first_response.status_code, 200)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

        second_response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "cancelled"},
            format="json"
        )

        self.assertEqual(second_response.status_code, 400)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_regular_user_cannot_update_order_status(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "paid"},
            format="json"
        )

        self.assertEqual(response.status_code, 403)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_unauthenticated_user_cannot_update_order_status(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.client.force_authenticate(user=None)

        response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "paid"},
            format="json"
        )

        self.assertEqual(response.status_code, 401)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_admin_cannot_skip_order_status_transitions(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "shipped"},
            format="json"
        )

        self.assertEqual(response.status_code, 400)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.Status.PENDING)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_user_can_cancel_own_pending_order(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

        response = self.client.post(
            f"/api/orders/{order_id}/cancel/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["order"]["status"],
            "cancelled"
        )

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_user_cannot_cancel_other_users_order(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        second_user = User.objects.create_user(
            username="cancel_test_user",
            password="TestPassword123!"
        )

        self.client.force_authenticate(user=second_user)

        response = self.client.post(
            f"/api/orders/{order_id}/cancel/"
        )

        self.assertEqual(response.status_code, 404)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.Status.PENDING)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_user_cannot_cancel_paid_order(self):
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")
        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        self.client.force_authenticate(user=self.admin_user)

        payment_response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "paid"},
            format="json"
        )

        self.assertEqual(payment_response.status_code, 200)

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f"/api/orders/{order_id}/cancel/"
        )

        self.assertEqual(response.status_code, 400)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.Status.PAID)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

        # Admin Order List Tests

    def test_admin_can_view_all_users_orders(self):
        # Create first user's order
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        first_response = self.client.post("/api/orders/create/")
        self.assertEqual(first_response.status_code, 201)

        # Create second user
        second_user = User.objects.create_user(
            username="second_admin_order_user",
            password="TestPassword123!"
        )

        second_cart = Cart.objects.create(user=second_user)

        CartItem.objects.create(
            cart=second_cart,
            product=self.product,
            quantity=1
        )

        # Create second user's order
        self.client.force_authenticate(user=second_user)
        second_response = self.client.post("/api/orders/create/")

        self.assertEqual(second_response.status_code, 201)

        # Login as admin
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get("/api/orders/admin/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

        usernames = [
            order["username"]
            for order in response.data["results"]
        ]

        self.assertIn("order_test_user", usernames)
        self.assertIn("second_admin_order_user", usernames)

    def test_regular_user_cannot_view_admin_order_list(self):
        response = self.client.get("/api/orders/admin/")

        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cannot_view_admin_order_list(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/orders/admin/")

        self.assertEqual(response.status_code, 401)

    def test_admin_can_filter_orders_by_status(self):
        # Create a pending order
        CartItem.objects.filter(cart=self.cart).update(quantity=1)

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        # Login as admin
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(
            "/api/orders/admin/?status=pending"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

        for order in response.data["results"]:
            self.assertEqual(order["status"], "pending")

    def test_admin_order_filter_rejects_invalid_status(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(
            "/api/orders/admin/?status=invalid"
        )

        self.assertEqual(response.status_code, 400)

        # Product Variant Order Tests

    def test_order_uses_selected_variant_and_reduces_variant_stock(self):
        # Remove the original cart item
        CartItem.objects.filter(cart=self.cart).delete()

        # Create a product with variants
        variant_product = Product.objects.create(
            name="Variant Test Product",
            description="Product with color and size",
            price=Decimal("2000000"),
            stock=0,
        )

        variant = ProductVariant.objects.create(
            product=variant_product,
            color="Black",
            size="Large",
            stock=5,
        )

        # Add selected variant to cart
        CartItem.objects.create(
            cart=self.cart,
            product=variant_product,
            variant=variant,
            quantity=2,
        )

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 201)

        variant.refresh_from_db()
        variant_product.refresh_from_db()

        # Only the selected variant stock should decrease
        self.assertEqual(variant.stock, 3)
        self.assertEqual(variant_product.stock, 0)

        order = Order.objects.get(user=self.user)
        order_item = order.items.first()

        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.variant_id, variant.id)
        self.assertEqual(order_item.variant_color, "Black")
        self.assertEqual(order_item.variant_size, "Large")
        self.assertEqual(order_item.price, Decimal("2000000"))

    def test_order_fails_when_variant_is_missing(self):
        CartItem.objects.filter(cart=self.cart).delete()

        variant_product = Product.objects.create(
            name="Variant Required Product",
            description="Product requiring variant selection",
            price=Decimal("2000000"),
            stock=0,
        )

        ProductVariant.objects.create(
            product=variant_product,
            color="White",
            size="Medium",
            stock=5,
        )

        # Add product without selecting a variant
        CartItem.objects.create(
            cart=self.cart,
            product=variant_product,
            quantity=1,
        )

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 400)

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            0,
        )

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            1,
        )

        variant = variant_product.variants.first()
        self.assertEqual(variant.stock, 5)

    def test_cancelling_variant_order_restores_variant_stock(self):
        CartItem.objects.filter(cart=self.cart).delete()

        variant_product = Product.objects.create(
            name="Variant Cancellation Product",
            description="Product for cancellation testing",
            price=Decimal("3000000"),
            stock=0,
        )

        variant = ProductVariant.objects.create(
            product=variant_product,
            color="Red",
            size="Small",
            stock=5,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=variant_product,
            variant=variant,
            quantity=2,
        )

        create_response = self.client.post("/api/orders/create/")

        self.assertEqual(create_response.status_code, 201)

        order_id = create_response.data["id"]

        variant.refresh_from_db()
        self.assertEqual(variant.stock, 3)

        # Cancel the pending order
        cancel_response = self.client.post(
            f"/api/orders/{order_id}/cancel/"
        )

        self.assertEqual(cancel_response.status_code, 200)

        variant.refresh_from_db()
        self.assertEqual(variant.stock, 5)

        # Check that variant information remains in order history
        order = Order.objects.get(id=order_id)
        order_item = order.items.first()

        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertEqual(order_item.variant_id, variant.id)
        self.assertEqual(order_item.variant_color, "Red")
        self.assertEqual(order_item.variant_size, "Small")

    def test_order_rejects_variant_belonging_to_another_product(self):
        CartItem.objects.filter(cart=self.cart).delete()

        first_product = Product.objects.create(
            name="First Variant Product",
            price=Decimal("1000000"),
            stock=0,
        )

        second_product = Product.objects.create(
            name="Second Variant Product",
            price=Decimal("1000000"),
            stock=0,
        )

        first_variant = ProductVariant.objects.create(
            product=first_product,
            color="Blue",
            size="Large",
            stock=5,
        )

        ProductVariant.objects.create(
            product=second_product,
            color="Black",
            size="Small",
            stock=5,
        )

        # Incorrectly connect the first product to the second product's variant
        CartItem.objects.create(
            cart=self.cart,
            product=second_product,
            variant=first_variant,
            quantity=1,
        )

        response = self.client.post("/api/orders/create/")

        self.assertEqual(response.status_code, 400)

        self.assertEqual(
            Order.objects.filter(user=self.user).count(),
            0,
        )

        first_variant.refresh_from_db()
        self.assertEqual(first_variant.stock, 5)

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            1,
        )

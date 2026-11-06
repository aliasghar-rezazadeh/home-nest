
from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from products.models import Product
from .models import Wishlist, WishlistItem


from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from django.db import close_old_connections
from django.test import TransactionTestCase

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken


class WishlistModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="TestPass123!"
        )

    def test_wishlist_belongs_to_user(self):
        wishlist = Wishlist.objects.create(user=self.user)

        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.user.username, "testuser")

    def test_user_can_have_only_one_wishlist(self):
        Wishlist.objects.create(user=self.user)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Wishlist.objects.create(user=self.user)


class WishlistAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="apiuser",
            password="TestPass123!"
        )

        self.product = Product.objects.create(
            name="Test Product",
            description="Product for testing",
            price=100000,
            stock=5
        )

        self.wishlist_url = reverse("wishlist")
        self.add_item_url = reverse("wishlist-add-item")

    def test_unauthenticated_user_cannot_view_wishlist(self):
        response = self.client.get(self.wishlist_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_authenticated_user_can_view_wishlist(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.wishlist_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(response.data["items"], [])

    def test_authenticated_user_can_add_product_to_wishlist(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.add_item_url,
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(len(response.data["items"]), 1)

        self.assertEqual(
            response.data["items"][0]["product"]["id"],
            self.product.id
        )

    def test_adding_duplicate_product_does_not_create_duplicate_item(self):
        self.client.force_authenticate(user=self.user)

        first_response = self.client.post(
            self.add_item_url,
            {"product_id": self.product.id},
            format="json"
        )

        second_response = self.client.post(
            self.add_item_url,
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK
        )

        wishlist = Wishlist.objects.get(user=self.user)

        self.assertEqual(wishlist.items.count(), 1)

    def test_authenticated_user_can_remove_product_from_wishlist(self):
        self.client.force_authenticate(user=self.user)

        add_response = self.client.post(
            self.add_item_url,
            {"product_id": self.product.id},
            format="json"
        )

        item_id = add_response.data["items"][0]["id"]

        remove_item_url = reverse(
            "wishlist-remove-item",
            kwargs={"pk": item_id}
        )

        response = self.client.delete(remove_item_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(response.data["items"], [])

    def test_user_cannot_remove_another_users_wishlist_item(self):
        another_user = User.objects.create_user(
            username="anotheruser",
            password="TestPass123!"
        )

        another_wishlist = Wishlist.objects.create(
            user=another_user
        )

        wishlist_item = WishlistItem.objects.create(
            wishlist=another_wishlist,
            product=self.product
        )

        self.client.force_authenticate(user=self.user)

        remove_item_url = reverse(
            "wishlist-remove-item",
            kwargs={"pk": wishlist_item.id}
        )

        response = self.client.delete(remove_item_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

        self.assertTrue(
            WishlistItem.objects.filter(
                id=wishlist_item.id
            ).exists()
        )

    
    def test_unauthenticated_user_cannot_add_product_to_wishlist(self):
        response = self.client.post(
            self.add_item_url,
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

        self.assertFalse(
            Wishlist.objects.filter(user=self.user).exists()
        )

    
    def test_user_cannot_add_nonexistent_product_to_wishlist(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.add_item_url,
            {"product_id": 999999},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertFalse(
            Wishlist.objects.filter(user=self.user).exists()
        )

    
    def test_toggle_adds_product_to_wishlist(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(response.data["is_favorite"])

        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist__user=self.user,
                product=self.product
            ).exists()
        )

    def test_toggle_removes_existing_product_from_wishlist(self):
        self.client.force_authenticate(user=self.user)

        self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.product.id},
            format="json"
        )

        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(response.data["is_favorite"])

        self.assertFalse(
            WishlistItem.objects.filter(
                wishlist__user=self.user,
                product=self.product
            ).exists()
        )

    def test_unauthenticated_user_cannot_toggle_wishlist(self):
        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.product.id},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

        self.assertFalse(
            Wishlist.objects.filter(user=self.user).exists()
        )



class WishlistConcurrencyTest(TransactionTestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="concurrentuser",
            password="TestPass123!"
        )

        self.product = Product.objects.create(
            name="Concurrent Test Product",
            description="Product for concurrency testing",
            price=100000,
            stock=5
        )

        self.wishlist = Wishlist.objects.create(
            user=self.user
        )

        self.access_token = str(
            AccessToken.for_user(self.user)
        )

        self.toggle_url = reverse("wishlist-toggle")
        self.barrier = Barrier(2)

    def send_toggle_request(self):
        close_old_connections()

        try:
            client = APIClient()

            client.credentials(
                HTTP_AUTHORIZATION=f"Bearer {self.access_token}"
            )

            self.barrier.wait(timeout=10)

            response = client.post(
                self.toggle_url,
                {"product_id": self.product.id},
                format="json"
            )

            return response.status_code

        finally:
            close_old_connections()

    def test_two_concurrent_toggle_requests(self):

        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(self.send_toggle_request),
                executor.submit(self.send_toggle_request),
            ]

            results = [
                future.result(timeout=30)
                for future in futures
            ]

        self.assertEqual(
            sorted(results),
            [200, 201]
        )

        self.assertFalse(
            WishlistItem.objects.filter(
                wishlist=self.wishlist,
                product=self.product
            ).exists()
        )


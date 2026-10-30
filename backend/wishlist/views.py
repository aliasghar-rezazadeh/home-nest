
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Wishlist, WishlistItem
from .serializers import (
    WishlistSerializer,
    AddWishlistItemSerializer,
)


class WishlistView(generics.RetrieveAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(
            user=self.request.user
        )
        return wishlist


class AddWishlistItemView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddWishlistItemSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user
        )

        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product
        )

        if not created:
            return Response(
                {"message": "این محصول قبلاً به علاقه‌مندی‌ها اضافه شده است."},
                status=status.HTTP_200_OK
            )

        return Response(
            WishlistSerializer(wishlist).data,
            status=status.HTTP_201_CREATED
        )


class RemoveWishlistItemView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            wishlist_item = WishlistItem.objects.get(
                id=pk,
                wishlist__user=request.user
            )
        except WishlistItem.DoesNotExist:
            return Response(
                {"error": "محصول در علاقه‌مندی‌ها پیدا نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist = wishlist_item.wishlist
        wishlist_item.delete()

        return Response(
            WishlistSerializer(wishlist).data,
            status=status.HTTP_200_OK
        )

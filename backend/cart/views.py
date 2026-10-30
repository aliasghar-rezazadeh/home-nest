from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddCartItemSerializer,
    UpdateCartItemSerializer,
)


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )

        return cart


class AddCartItemView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddCartItemSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": 1}
        )

        if not created:
            if cart_item.quantity >= product.stock:
                return Response(
                    {"error": "موجودی کافی نیست."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity += 1
            cart_item.save()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK
        )

class UpdateCartItemView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateCartItemSerializer

    def patch(self, request, pk):
        try:
            cart_item = CartItem.objects.get(
                id=pk,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "محصول در سبد خرید پیدا نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(
            data=request.data,
            context={"cart_item": cart_item}
        )

        serializer.is_valid(raise_exception=True)

        cart_item.quantity = serializer.validated_data["quantity"]
        cart_item.save()

        return Response(
            CartSerializer(cart_item.cart).data,
            status=status.HTTP_200_OK
        )       

class RemoveCartItemView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(
                id=pk,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "محصول در سبد خرید پیدا نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        cart = cart_item.cart
        cart_item.delete()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK
        )        
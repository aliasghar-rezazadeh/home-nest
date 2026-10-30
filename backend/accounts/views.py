
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import RegisterSerializer, UserProfileSerializer
from core.permissions import IsAdminRole


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        return Response({
            "message": "Welcome to HomeNest Admin Dashboard",
            "username": request.user.username,
            "role": request.user.profile.role,
        })

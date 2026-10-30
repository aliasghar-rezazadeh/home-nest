
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
            "password2",
        ]

        read_only_fields = ["id"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password": "رمز عبور و تکرار آن یکسان نیستند."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):

    role = serializers.CharField(
        source="profile.role",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
        ]

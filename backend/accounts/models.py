
from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):

    class Role(models.TextChoices):
        CUSTOMER = "customer", "مشتری"
        ADMIN = "admin", "مدیر"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

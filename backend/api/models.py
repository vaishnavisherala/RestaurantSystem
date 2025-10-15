from django.db import models
from django.contrib.auth.models import User
from django.db.models import F

class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
    ]
    number = models.CharField(max_length=10, unique=True)
    seats = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    note = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Table {self.number} ({self.status})"


class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),     # reserved but not paid
        ('completed', 'Completed'), # after checkout/payment
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_price(self):
        return sum([oi.quantity * float(oi.item.price) for oi in self.orderitem_set.all()])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('order', 'item')

    def subtotal(self):
        return float(self.quantity) * float(self.item.price)

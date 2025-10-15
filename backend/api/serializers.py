# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Item, Order, OrderItem,Table

# ----------------------
# Existing serializers
# ----------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email','is_staff', 'is_superuser']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'seats', 'status', 'note']


class ItemSerializer(serializers.ModelSerializer):
    price = serializers.FloatField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'price', 'available']


class OrderItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_id', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    table = TableSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    table_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'user', 'table', 'table_id', 'status', 'items', 'name',  'total_price', 'created_at']
        read_only_fields = ['user', 'status', 'created_at', 'total_price']

    def get_total_price(self, obj):
        return round(obj.total_price, 2)


# ----------------------
# Custom JWT serializer
# ----------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow login with username or email.
    """
    def validate(self, attrs):
        # Check if 'email' key exists in payload
        if 'email' in attrs:
            try:
                user = User.objects.get(email=attrs['email'])
                attrs['username'] = user.username  # TokenObtainPairSerializer expects username
            except User.DoesNotExist:
                raise serializers.ValidationError({"detail": "No user found with this email."})
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims here if needed
        token['username'] = user.username
        token['email'] = user.email
        return token

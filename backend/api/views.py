from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Item, Order, OrderItem,Table
from .serializers import ItemSerializer, OrderSerializer, UserSerializer,TableSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
# ---------------------------
# Signup API
# ---------------------------
@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

# ---------------------------
# Permissions
# ---------------------------
class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow only admins to edit, everyone can read."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsSuperAdmin(permissions.BasePermission):
    """Allow only superadmins to access."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser

# ---------------------------
# Item ViewSet
# ---------------------------
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('number')
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]  # you can restrict create/update to staff with custom permission

# ItemViewSet (same as before)
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # superadmin sees all, others only their orders
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def place_order(self, request):
        """
        Atomically create order and reserve the table.
        Expected payload:
        {
            "table_id": 1,
            "items": [{"item_id": 1, "quantity": 2}, ...]
        }
        """
        user = request.user
        table_id = request.data.get('table_id')
        items = request.data.get('items', [])

        if not table_id:
            return Response({'error': 'table_id required'}, status=400)
        if not items:
            return Response({'error': 'items required'}, status=400)

        with transaction.atomic():
            # lock the table row
            table = get_object_or_404(Table.objects.select_for_update(), id=table_id)
            if table.status == 'booked':
                return Response({'error': 'Table already booked'}, status=409)

            # reserve the table
            table.status = 'booked'
            table.save()

            # create order
            order = Order.objects.create(user=user, table=table, status='pending')

            # add items
            for it in items:
                item_id = it.get('item_id')
                qty = int(it.get('quantity', 1))
                item = get_object_or_404(Item, id=item_id)
                OrderItem.objects.create(order=order, item=item, quantity=qty)

            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data, status=201)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add item to existing order (only if pending)"""
        order = self.get_object()
        if order.status != 'pending':
            return Response({'error': 'Order not editable'}, status=400)

        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        item = get_object_or_404(Item, id=item_id)
        order_item, created = OrderItem.objects.get_or_create(order=order, item=item)
        if created:
            order_item.quantity = quantity
        else:
            order_item.quantity += quantity
        order_item.save()
        return Response({'status': 'item added', 'order_id': order.id})

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        """Complete order (payment) and release the table"""
        order = self.get_object()

        # ✅ Prevent double or invalid checkout
        if order.status == 'completed':
            return Response({'error': 'Order already completed'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status != 'pending':
            return Response({'error': 'Order not pending'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Handle both "phone" and "phone_number" keys from frontend
        name = request.data.get('name')
        phone = request.data.get('phone') or request.data.get('phone_number')

        if not name or not phone:
            return Response({'error': 'Name and phone number required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Update order details
            order.name = name
            order.phone_number = phone
            order.status = 'completed'
            order.save()

            # Release table if exists
            if order.table:
                table = order.table
                table.status = 'available'
                table.save()

        # ✅ Return order data for frontend
        serializer = OrderSerializer(order, context={'request': request})
        return Response({
            'message': 'Checkout successful',
            'order': serializer.data
        }, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel order and free table"""
        order = self.get_object()
        if order.status == 'completed':
            return Response({'error': 'Cannot cancel completed order'}, status=400)

        with transaction.atomic():
            order.status = 'cancelled'
            order.save()
            if order.table:
                t = order.table
                t.status = 'available'
                t.save()
        return Response({'status': 'order cancelled'})

# ---------------------------
# User ViewSet
# ---------------------------
class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperAdmin]

    def list(self, request):
        """Superadmins see all users, others see only themselves"""
        user = request.user
        if user.is_superuser:
            queryset = User.objects.all()
            serializer = UserSerializer(queryset, many=True)
        else:
            serializer = UserSerializer(user)
        return Response(serializer.data)

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import ExtractHour, TruncDate
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import connection
from django.core.exceptions import ValidationError
from datetime import timedelta
import decimal
import time

from .models import (
    Category, FoodItem, Table, Cart, CartItem, Order, OrderItem,
    Payment, Inventory, Staff, Coupon, Review
)
from .serializers import (
    CategorySerializer, FoodItemSerializer, TableSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer,
    PaymentSerializer, InventorySerializer, StaffSerializer, CouponSerializer,
    ReviewSerializer, UserSerializer
)
from django.http import JsonResponse
from django.db import connection

def health(request):
    start_time = time.time()
    
    # Check database connectivity
    db_status = "ok"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    response_time = (time.time() - start_time) * 1000  # Convert to ms
    
    health_data = {
        "status": "ok" if db_status == "ok" else "degraded",
        "timestamp": timezone.now().isoformat(),
        "database": {
            "status": db_status
        },
        "response_time_ms": round(response_time, 2)
    }
    
    return JsonResponse(health_data)
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# Table ViewSet
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('number')
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'], url_path=r'by-number/(?P<number>\d+)')
    def by_number(self, request, number=None):
        try:
            table = Table.objects.get(number=number, is_active=True)
            serializer = self.get_serializer(table)
            return Response(serializer.data)
        except Table.DoesNotExist:
            return Response({'error': 'Table not found or inactive'}, status=status.HTTP_404_NOT_FOUND)

# Category ViewSet
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

# FoodItem ViewSet
class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all().order_by('name')
    serializer_class = FoodItemSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'prep_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Category filtering
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        # Veg/Non-Veg filter
        is_veg = self.request.query_params.get('is_veg')
        if is_veg is not None:
            queryset = queryset.filter(is_veg=is_veg.lower() == 'true')
            
        # Availability filter
        is_available = self.request.query_params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
            
        # Bestseller filter
        is_bestseller = self.request.query_params.get('is_bestseller')
        if is_bestseller is not None:
            queryset = queryset.filter(is_bestseller=is_bestseller.lower() == 'true')

        # Custom Sorting
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'popularity':
            queryset = queryset.annotate(order_count=Count('orderitem')).order_by('-order_count')

        return queryset

# Cart ViewSet
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='get-or-create')
    def get_or_create_cart(self, request):
        cart_id = request.data.get('cart_id')
        if cart_id:
            try:
                cart = Cart.objects.get(id=cart_id)
            except (Cart.DoesNotExist, ValueError, ValidationError):
                cart = Cart.objects.create()
        else:
            cart = Cart.objects.create()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='add-item')
    def add_item(self, request, pk=None):
        cart = self.get_object()
        food_item_id = request.data.get('food_item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            food_item = FoodItem.objects.get(id=food_item_id)
        except FoodItem.DoesNotExist:
            return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, food_item=food_item)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response(self.get_serializer(cart).data)

    @action(detail=True, methods=['post'], url_path='update-item-quantity')
    def update_item_quantity(self, request, pk=None):
        cart = self.get_object()
        food_item_id = request.data.get('food_item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(cart=cart, food_item_id=food_item_id)
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not in cart'}, status=status.HTTP_404_NOT_FOUND)

        return Response(self.get_serializer(cart).data)

    @action(detail=True, methods=['post'], url_path='remove-item')
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        food_item_id = request.data.get('food_item_id')

        try:
            cart_item = CartItem.objects.get(cart=cart, food_item_id=food_item_id)
            cart_item.delete()
        except CartItem.DoesNotExist:
            pass

        return Response(self.get_serializer(cart).data)

    @action(detail=True, methods=['post'], url_path='clear')
    def clear_cart(self, request, pk=None):
        cart = self.get_object()
        cart.items.all().delete()
        return Response(self.get_serializer(cart).data)

# Order ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter for Admin Panels
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(order_status=status_filter)
            
        today = self.request.query_params.get('today')
        if today and today.lower() == 'true':
            queryset = queryset.filter(created_at__date=timezone.now().date())
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(customer_name__icontains=search) | queryset.filter(id__icontains=search)
            
        return queryset

    def create(self, request, *args, **kwargs):
        cart_id = request.data.get('cart_id')
        table_number = request.data.get('table_number')
        customer_name = request.data.get('customer_name', '')
        customer_phone = request.data.get('customer_phone', '')
        special_instructions = request.data.get('special_instructions', '')
        payment_method = request.data.get('payment_method', 'ONLINE')
        coupon_code = request.data.get('coupon_code')

        try:
            cart = Cart.objects.get(id=cart_id)
        except (Cart.DoesNotExist, ValueError):
            return Response({'error': 'Invalid or missing cart ID'}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or assign table
        table = None
        if table_number:
            try:
                table = Table.objects.get(number=table_number)
            except Table.DoesNotExist:
                return Response({'error': f'Table {table_number} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate values
        subtotal = sum(item.quantity * item.food_item.price for item in cart.items.all())
        
        # Apply coupon if exists
        discount = decimal.Decimal('0.00')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, active=True)
                now = timezone.now()
                if coupon.valid_from <= now <= coupon.valid_to and subtotal >= coupon.min_order_amount:
                    if coupon.discount_type == 'PERCENTAGE':
                        discount = subtotal * (coupon.discount_value / decimal.Decimal('100.00'))
                    else:
                        discount = coupon.discount_value
            except Coupon.DoesNotExist:
                pass

        subtotal_after_discount = max(subtotal - discount, decimal.Decimal('0.00'))
        tax = subtotal_after_discount * decimal.Decimal('0.05')  # 5% tax
        total = subtotal_after_discount + tax

        # Create Order
        order = Order.objects.create(
            table=table,
            customer_name=customer_name,
            customer_phone=customer_phone,
            special_instructions=special_instructions,
            subtotal_amount=subtotal_after_discount,
            tax_amount=tax,
            total_amount=total,
            payment_method=payment_method,
            payment_status='PENDING'
        )

        # Create OrderItems & update stock if applicable
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                food_item=item.food_item,
                quantity=item.quantity,
                price=item.food_item.price
            )

        # Create initial Payment record
        Payment.objects.create(
            order=order,
            payment_method=payment_method,
            payment_status='PENDING',
            amount=total
        )

        # Clear cart
        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        payment_status = request.data.get('payment_status')

        valid_statuses = [choice[0] for choice in Order.ORDER_STATUSES]
        if new_status and new_status not in valid_statuses:
            return Response({'error': f'Invalid status: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

        if new_status:
            order.order_status = new_status
            if new_status == 'COMPLETED':
                order.payment_status = 'PAID'
                # Update underlying Payment object
                try:
                    payment = order.payment_details
                    payment.payment_status = 'PAID'
                    payment.save()
                except Payment.DoesNotExist:
                    pass
            order.save()

        if payment_status:
            order.payment_status = payment_status
            order.save()
            try:
                payment = order.payment_details
                payment.payment_status = payment_status
                payment.save()
            except Payment.DoesNotExist:
                pass

        return Response(self.get_serializer(order).data)

# Inventory ViewSet
class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().order_by('name')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        low_items = self.queryset.filter(quantity__lte=F('low_stock_threshold'))
        serializer = self.get_serializer(low_items, many=True)
        return Response(serializer.data)

# Staff ViewSet
class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by('name')
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAdminUser]

# Coupon ViewSet
class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-valid_to')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        code = request.data.get('code')
        amount = decimal.Decimal(str(request.data.get('amount', 0)))
        
        try:
            coupon = Coupon.objects.get(code=code, active=True)
            now = timezone.now()
            if coupon.valid_from <= now <= coupon.valid_to:
                if amount >= coupon.min_order_amount:
                    serializer = self.get_serializer(coupon)
                    return Response({
                        'valid': True,
                        'coupon': serializer.data
                    })
                else:
                    return Response({
                        'valid': False,
                        'message': f'Minimum order amount to use this coupon is Rs. {coupon.min_order_amount}'
                    })
            else:
                return Response({'valid': False, 'message': 'Coupon has expired'})
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Invalid coupon code'})

# Review ViewSet
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_approved=True)
        return queryset

    @action(detail=True, methods=['post'], url_path='toggle-approval')
    def toggle_approval(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        review = self.get_object()
        review.is_approved = not review.is_approved
        review.save()
        return Response(self.get_serializer(review).data)

# Auth Endpoint
class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = UserSerializer(request.user)
        # Add staff details
        data = serializer.data
        try:
            staff = request.user.staff_profile
            data['role'] = staff.role
            data['name'] = staff.name
        except Staff.DoesNotExist:
            data['role'] = 'SUPERUSER' if request.user.is_superuser else 'NONE'
            data['name'] = request.user.username
        return Response(data)

# Analytics Dashboard View
class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)

        # Revenue computations
        todays_revenue = Order.objects.filter(
            created_at__date=today, payment_status='PAID'
        ).aggregate(total=Sum('total_amount'))['total'] or decimal.Decimal('0.00')

        weekly_revenue = Order.objects.filter(
            created_at__date__gte=start_of_week, payment_status='PAID'
        ).aggregate(total=Sum('total_amount'))['total'] or decimal.Decimal('0.00')

        monthly_revenue = Order.objects.filter(
            created_at__date__gte=start_of_month, payment_status='PAID'
        ).aggregate(total=Sum('total_amount'))['total'] or decimal.Decimal('0.00')

        # Total Orders & AOV
        total_orders = Order.objects.all().count()
        avg_order_value = Order.objects.filter(payment_status='PAID').aggregate(avg=Avg('total_amount'))['avg'] or decimal.Decimal('0.00')

        # 1. Daily Sales Chart Data (Last 7 Days)
        daily_sales = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_rev = Order.objects.filter(
                created_at__date=day, payment_status='PAID'
            ).aggregate(total=Sum('total_amount'))['total'] or decimal.Decimal('0.00')
            day_orders = Order.objects.filter(created_at__date=day).count()
            daily_sales.append({
                'date': day.strftime('%a'),
                'revenue': float(day_rev),
                'orders': day_orders
            })

        # 2. Food Analytics: Best & Least Sellers
        best_sellers = OrderItem.objects.values(
            name=F('food_item__name')
        ).annotate(
            sales=Sum('quantity'),
            revenue=Sum(F('quantity') * F('price'))
        ).order_by('-sales')[:5]

        least_sellers = OrderItem.objects.values(
            name=F('food_item__name')
        ).annotate(
            sales=Sum('quantity')
        ).order_by('sales')[:5]

        # Filter out None names (if food items deleted)
        best_sellers = [item for item in best_sellers if item['name']]
        least_sellers = [item for item in least_sellers if item['name']]

        # 3. Most Ordered & Revenue By Category
        category_stats = OrderItem.objects.values(
            category_name=F('food_item__category__name')
        ).annotate(
            orders=Count('order', distinct=True),
            value=Sum(F('quantity') * F('price'))
        ).order_by('-value')

        category_data = [
            {'name': item['category_name'] or 'Unknown', 'value': float(item['value'] or 0)} 
            for item in category_stats
        ]

        # 4. Peak Hours (Order count by hour)
        hours_stats = Order.objects.annotate(
            hour=ExtractHour('created_at')
        ).values('hour').annotate(
            orders=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('hour')

        # Create a list for all 24 hours, filling missing with 0
        hourly_data = []
        hours_map = {item['hour']: item for item in hours_stats}
        for h in range(8, 23):  # Standard Cafe Hours: 8 AM to 10 PM
            stat = hours_map.get(h, {'orders': 0, 'revenue': 0})
            hourly_data.append({
                'hour': f"{h:02d}:00",
                'orders': stat['orders'],
                'revenue': float(stat['revenue'] or 0)
            })

        # 5. Payment Analytics (Share of Online, Counter, Waiter)
        payment_stats = Order.objects.values('payment_method').annotate(
            orders=Count('id'),
            revenue=Sum('total_amount')
        )
        payment_data = []
        payment_labels = {'ONLINE': 'Online Payment', 'COUNTER': 'Counter Cash', 'WAITER': 'Paid To Waiter'}
        for stat in payment_stats:
            method = stat['payment_method']
            payment_data.append({
                'name': payment_labels.get(method, method),
                'value': float(stat['revenue'] or 0),
                'orders': stat['orders']
            })

        # Low stock alerts count
        low_stock_count = Inventory.objects.filter(quantity__lte=F('low_stock_threshold')).count()

        return Response({
            'kpis': {
                'todays_revenue': float(todays_revenue),
                'weekly_revenue': float(weekly_revenue),
                'monthly_revenue': float(monthly_revenue),
                'total_orders': total_orders,
                'avg_order_value': float(avg_order_value),
                'low_stock_count': low_stock_count,
            },
            'daily_sales': daily_sales,
            'best_sellers': best_sellers,
            'least_sellers': least_sellers,
            'category_share': category_data,
            'hourly_stats': hourly_data,
            'payment_share': payment_data
        })

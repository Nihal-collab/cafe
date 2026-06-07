from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, FoodItem, Table, Cart, CartItem, Order, OrderItem,
    Payment, Inventory, Staff, Coupon, Review
)

# User Serializer for Admin details
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

# Table Serializer
class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

# Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    food_item_name = serializers.ReadOnlyField(source='food_item.name')

    class Meta:
        model = Review
        fields = '__all__'

# Food Item Serializer
class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    average_rating = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = FoodItem
        fields = '__all__'

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if not reviews.exists():
            return 5.0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

# Category Serializer (with optional nested items)
class CategorySerializer(serializers.ModelSerializer):
    food_items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_food_items_count(self, obj):
        return obj.food_items.filter(is_available=True).count()

# Cart Item Serializer
class CartItemSerializer(serializers.ModelSerializer):
    food_item_details = FoodItemSerializer(source='food_item', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'food_item', 'food_item_details', 'quantity', 'subtotal')

    def get_subtotal(self, obj):
        return obj.quantity * obj.food_item.price

# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_amount', 'items_count', 'created_at', 'updated_at')

    def get_total_amount(self, obj):
        return sum(item.quantity * item.food_item.price for item in obj.items.all())

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

# Order Item Serializer
class OrderItemSerializer(serializers.ModelSerializer):
    food_item_details = FoodItemSerializer(source='food_item', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'food_item', 'food_item_details', 'quantity', 'price', 'subtotal')

    def get_subtotal(self, obj):
        return obj.quantity * obj.price

# Order Serializer
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.ReadOnlyField(source='table.number')

    class Meta:
        model = Order
        fields = '__all__'

# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

# Inventory Serializer
class InventorySerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = '__all__'

    def get_status(self, obj):
        if obj.quantity <= obj.low_stock_threshold:
            return 'LOW_STOCK'
        return 'IN_STOCK'

# Staff Serializer
class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Staff
        fields = '__all__'

# Coupon Serializer
class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = '__all__'

    def get_is_valid(self, obj):
        from django.utils import timezone
        now = timezone.now()
        return obj.active and obj.valid_from <= now <= obj.valid_to

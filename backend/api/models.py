from django.db import models
from django.contrib.auth.models import User
import uuid

class Table(models.Model):
    number = models.IntegerField(unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.number}"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    image = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class FoodItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="food_items")
    name = models.CharField(max_length=150)
    description = models.TextField()
    price = models.DecimalField(max_length=10, max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500)
    is_veg = models.BooleanField(default=True)
    prep_time = models.IntegerField(default=15, help_text="Preparation time in minutes")
    is_available = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.id}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'food_item')

    def __str__(self):
        return f"{self.quantity} x {self.food_item.name} in {self.cart.id}"

class Order(models.Model):
    PAYMENT_METHODS = (
        ('ONLINE', 'Pay Online'),
        ('COUNTER', 'Pay At Counter'),
        ('WAITER', 'Pay To Waiter'),
    )
    
    PAYMENT_STATUSES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    )

    ORDER_STATUSES = (
        ('RECEIVED', 'Order Received'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready'),
        ('SERVED', 'Served'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    customer_phone = models.CharField(max_length=15, blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    subtotal_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHODS, default='ONLINE')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUSES, default='PENDING')
    order_status = models.CharField(max_length=15, choices=ORDER_STATUSES, default='RECEIVED')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} (Table {self.table.number if self.table else 'N/A'})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    food_item = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot of price at purchase

    def __str__(self):
        return f"{self.quantity} x {self.food_item.name if self.food_item else 'Deleted Item'} for Order {self.order.id}"

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment_details")
    payment_method = models.CharField(max_length=15, choices=Order.PAYMENT_METHODS)
    payment_status = models.CharField(max_length=15, choices=Order.PAYMENT_STATUSES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} for Order {self.order.id} ({self.payment_status})"

class Inventory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unit = models.CharField(max_length=20, default='kg')  # e.g., kg, grams, liters, pcs
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Inventory"

    def __str__(self):
        return f"{self.name} - {self.quantity} {self.unit}"

class Staff(models.Model):
    ROLES = (
        ('WAITER', 'Waiter'),
        ('KITCHEN', 'Kitchen Staff'),
        ('ADMIN', 'Admin Manager'),
    )
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="staff_profile")
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLES, default='WAITER')
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Staff"

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"

class Coupon(models.Model):
    DISCOUNT_TYPES = (
        ('PERCENTAGE', 'Percentage Discount'),
        ('FIXED', 'Fixed Amount Discount'),
    )
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='PERCENTAGE')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()

    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.discount_type})"

class Review(models.Model):
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name="reviews")
    customer_name = models.CharField(max_length=100, default="Anonymous")
    rating = models.IntegerField(default=5)  # 1 to 5 stars
    comment = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.food_item.name} by {self.customer_name} ({self.rating}★)"

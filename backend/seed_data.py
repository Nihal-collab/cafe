import os
import django
import sys
import random
import decimal
from datetime import datetime, timedelta
from django.utils import timezone

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafe_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    Category, FoodItem, Table, Order, OrderItem,
    Payment, Inventory, Staff, Coupon, Review
)

def seed_db():
    print("Seeding database...")

    # 1. Create Tables
    print("Creating Tables...")
    Table.objects.all().delete()
    tables = []
    for i in range(1, 16):
        t = Table.objects.create(number=i, is_active=True)
        tables.append(t)
    print(f"Created {len(tables)} tables.")

    # 2. Create Admin & Staff
    print("Creating Staff & Users...")
    User.objects.all().delete()
    Staff.objects.all().delete()
    
    # Admin User
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@cafe.com',
        password='password123',
        first_name='Cafe',
        last_name='Manager'
    )
    admin_staff = Staff.objects.create(
        user=admin_user,
        name="John Doe",
        role='ADMIN',
        phone='9876543210',
        is_active=True
    )
    
    # Waiters
    waiter_names = ["Robert Smith", "Sarah Connor", "Emily Watson"]
    waiters = []
    for idx, name in enumerate(waiter_names):
        w_user = User.objects.create_user(
            username=f'waiter{idx+1}',
            email=f'waiter{idx+1}@cafe.com',
            password='password123',
            first_name=name.split()[0],
            last_name=name.split()[1]
        )
        w = Staff.objects.create(
            user=w_user,
            name=name,
            role='WAITER',
            phone=f'999888777{idx}',
            is_active=True
        )
        waiters.append(w)
        
    # Kitchen Staff
    kitchen_names = ["Chef Marco", "Chef Julia"]
    kitchen_staff = []
    for idx, name in enumerate(kitchen_names):
        k_user = User.objects.create_user(
            username=f'kitchen{idx+1}',
            email=f'kitchen{idx+1}@cafe.com',
            password='password123',
            first_name=name.split()[0],
            last_name=name.split()[1]
        )
        k = Staff.objects.create(
            user=k_user,
            name=name,
            role='KITCHEN',
            phone=f'999111222{idx}',
            is_active=True
        )
        kitchen_staff.append(k)
        
    print("Created users and staff profiles.")

    # 3. Create Categories
    print("Creating Categories...")
    Category.objects.all().delete()
    
    categories_data = [
        {"name": "Coffee", "slug": "coffee", "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60"},
        {"name": "Beverages", "slug": "beverages", "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"},
        {"name": "Desserts", "slug": "desserts", "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60"},
        {"name": "Starters", "slug": "starters", "image": "https://images.unsplash.com/photo-1541014741259-df5290db5785?w=500&auto=format&fit=crop&q=60"},
        {"name": "Soups", "slug": "soups", "image": "https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=500&auto=format&fit=crop&q=60"},
        {"name": "Main Course", "slug": "main-course", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"},
        {"name": "Rice & Biryani", "slug": "rice-biryani", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60"},
        {"name": "Pizza", "slug": "pizza", "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"},
        {"name": "Burgers", "slug": "burgers", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"},
        {"name": "Sandwiches", "slug": "sandwiches", "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60"},
    ]
    
    categories = {}
    for cat in categories_data:
        c = Category.objects.create(name=cat["name"], slug=cat["slug"], image=cat["image"])
        categories[cat["slug"]] = c
    print(f"Created {len(categories)} categories.")

    # 4. Create Food Items
    print("Creating Food Items...")
    FoodItem.objects.all().delete()
    
    food_items_data = [
        # Coffee
        {"category": "coffee", "name": "Espresso Gold", "description": "Rich, intense, and dark espresso shot topped with creamy crema. Sourced from organic beans.", "price": 120.00, "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 5, "is_available": True, "is_bestseller": False},
        {"category": "coffee", "name": "Classic Cappuccino", "description": "Perfect balance of espresso, steamed milk, and rich foam, finished with a dash of cocoa.", "price": 160.00, "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 7, "is_available": True, "is_bestseller": True},
        {"category": "coffee", "name": "Caramel Macchiato", "description": "Freshly steamed milk with vanilla-flavored syrup, marked with espresso and drizzled with caramel sauce.", "price": 190.00, "image": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 8, "is_available": True, "is_bestseller": True},
        {"category": "coffee", "name": "Irish Coffee Shake", "description": "Chilled double espresso blended with ice cream, milk, and Irish syrup.", "price": 220.00, "image": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 8, "is_available": True, "is_bestseller": False},
        
        # Beverages
        {"category": "beverages", "name": "Mint Mojito", "description": "Refreshing lime juice, mint leaves, simple syrup, and club soda served over crushed ice.", "price": 140.00, "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 5, "is_available": True, "is_bestseller": True},
        {"category": "beverages", "name": "Fresh Orange Juice", "description": "100% natural, freshly squeezed orange juice rich in Vitamin C.", "price": 120.00, "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 5, "is_available": True, "is_bestseller": False},
        {"category": "beverages", "name": "Iced Lemon Tea", "description": "Brewed black tea infused with natural lemon and served cold.", "price": 110.00, "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 4, "is_available": True, "is_bestseller": False},
        
        # Desserts
        {"category": "desserts", "name": "Sizzling Chocolate Brownie", "description": "Warm chocolate brownie served on a sizzler plate, topped with vanilla ice cream and hot chocolate fudge.", "price": 240.00, "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 10, "is_available": True, "is_bestseller": True},
        {"category": "desserts", "name": "Tiramisu Delight", "description": "Italian dessert made of coffee-dipped ladyfingers, layered with whipped mascarpone cheese and cocoa powder.", "price": 260.00, "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 6, "is_available": True, "is_bestseller": True},
        {"category": "desserts", "name": "Blueberry Cheesecake", "description": "Creamy baked New York cheesecake topped with sweet blueberry compote.", "price": 230.00, "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 5, "is_available": True, "is_bestseller": False},

        # Starters
        {"category": "starters", "name": "Garlic Bread with Cheese", "description": "Baked french bread topped with garlic butter, parsley, and melted mozzarella.", "price": 150.00, "image": "https://images.unsplash.com/photo-1573145959956-e9fae6b8845d?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 8, "is_available": True, "is_bestseller": False},
        {"category": "starters", "name": "Chicken Peri Peri Wings", "description": "Crispy chicken wings tossed in spicy peri peri glaze, served with garlic dip.", "price": 250.00, "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60", "is_veg": False, "prep_time": 15, "is_available": True, "is_bestseller": True},
        
        # Pizza
        {"category": "pizza", "name": "Margherita Garden", "description": "Classic Neapolitan pizza topped with fresh tomato sauce, mozzarella cheese, and fresh basil.", "price": 320.00, "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 15, "is_available": True, "is_bestseller": True},
        {"category": "pizza", "name": "Spicy Pepperoni Pizza", "description": "Double portion of spicy beef/chicken pepperoni, jalapenos, and mozzarella.", "price": 420.00, "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60", "is_veg": False, "prep_time": 15, "is_available": True, "is_bestseller": True},

        # Burgers
        {"category": "burgers", "name": "Aloo Tikki Burger", "description": "Spicy mashed potato patty with greens, onions, and signature mint sauce.", "price": 130.00, "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 10, "is_available": True, "is_bestseller": False},
        {"category": "burgers", "name": "Grande Chicken Cheese Burger", "description": "Flame-grilled double chicken patty, cheddar slice, caramelized onion, lettuce, and secret burger sauce.", "price": 280.00, "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60", "is_veg": False, "prep_time": 12, "is_available": True, "is_bestseller": True},

        # Sandwiches
        {"category": "sandwiches", "name": "Paneer Tikka Sandwich", "description": "Grilled sandwich stuffed with marinated paneer, capsicum, onion, and spiced mayo.", "price": 170.00, "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60", "is_veg": True, "prep_time": 10, "is_available": True, "is_bestseller": False},
        {"category": "sandwiches", "name": "Classic Club Sandwich", "description": "Triple-decker sandwich with grilled chicken breast, fried egg, lettuce, tomato, and mayo.", "price": 210.00, "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=60", "is_veg": False, "prep_time": 12, "is_available": True, "is_bestseller": True},
    ]
    
    food_items = []
    for food in food_items_data:
        cat_obj = categories[food["category"]]
        f = FoodItem.objects.create(
            category=cat_obj,
            name=food["name"],
            description=food["description"],
            price=food["price"],
            image=food["image"],
            is_veg=food["is_veg"],
            prep_time=food["prep_time"],
            is_available=food["is_available"],
            is_bestseller=food["is_bestseller"]
        )
        food_items.append(f)
    print(f"Created {len(food_items)} food items.")

    # 5. Create Inventory Stocks
    print("Creating Inventory Items...")
    Inventory.objects.all().delete()
    
    inventory_data = [
        {"name": "Coffee Beans Arabica", "quantity": 12.50, "unit": "kg", "low_stock_threshold": 5.00},
        {"name": "Full Cream Milk", "quantity": 3.00, "unit": "liters", "low_stock_threshold": 10.00},  # triggers warning!
        {"name": "Mozzarella Cheese", "quantity": 8.00, "unit": "kg", "low_stock_threshold": 3.00},
        {"name": "Burger Buns", "quantity": 12.00, "unit": "pcs", "low_stock_threshold": 15.00},      # triggers warning!
        {"name": "Chicken Breast", "quantity": 15.00, "unit": "kg", "low_stock_threshold": 6.00},
        {"name": "Fresh Mint Leaves", "quantity": 1.20, "unit": "kg", "low_stock_threshold": 0.50},
        {"name": "Sugar Syrup", "quantity": 4.50, "unit": "liters", "low_stock_threshold": 2.00},
    ]
    
    for inv in inventory_data:
        Inventory.objects.create(
            name=inv["name"],
            quantity=inv["quantity"],
            unit=inv["unit"],
            low_stock_threshold=inv["low_stock_threshold"]
        )
    print("Created inventory assets.")

    # 6. Create Coupons
    print("Creating Coupons...")
    Coupon.objects.all().delete()
    
    now = timezone.now()
    Coupon.objects.create(
        code="WELCOME10",
        discount_type="PERCENTAGE",
        discount_value=10.00,
        min_order_amount=200.00,
        active=True,
        valid_from=now - timedelta(days=5),
        valid_to=now + timedelta(days=90)
    )
    Coupon.objects.create(
        code="COFFEEGOLD",
        discount_type="FIXED",
        discount_value=50.00,
        min_order_amount=300.00,
        active=True,
        valid_from=now - timedelta(days=2),
        valid_to=now + timedelta(days=30)
    )
    print("Created coupons.")

    # 7. Create Reviews
    print("Creating Reviews...")
    Review.objects.all().delete()
    
    reviews_data = [
        {"customer_name": "Alice Green", "rating": 5, "comment": "The Caramel Macchiato was absolutely stunning! Will visit again."},
        {"customer_name": "Rohan Das", "rating": 5, "comment": "Classic Margherita Garden is perfect. Base is thin and crispy."},
        {"customer_name": "Sunny Leone", "rating": 4, "comment": "Loved the Sizzling Brownie, but preparation took slightly longer."},
        {"customer_name": "Vikram Sen", "rating": 5, "comment": "Classic Cappuccino is a work of art. The foam art was beautiful!"},
    ]
    
    for rev in reviews_data:
        # Assign randomly to bestseller food items
        bestsellers = [f for f in food_items if f.is_bestseller]
        f_item = random.choice(bestsellers) if bestsellers else food_items[0]
        Review.objects.create(
            food_item=f_item,
            customer_name=rev["customer_name"],
            rating=rev["rating"],
            comment=rev["comment"],
            is_approved=True
        )
    print("Created customer reviews.")

    # 8. Create Order History (for Analytics Dashboard)
    print("Creating Historical Orders (for analytics visualization)...")
    Order.objects.all().delete()
    OrderItem.objects.all().delete()
    Payment.objects.all().delete()

    payment_methods = ['ONLINE', 'COUNTER', 'WAITER']
    statuses = ['COMPLETED', 'SERVED', 'READY', 'PREPARING', 'RECEIVED']
    
    # Let's seed orders for the last 7 days
    total_seeded_orders = 0
    today = timezone.now()
    
    for day_offset in range(7):
        order_date = today - timedelta(days=day_offset)
        
        # Number of orders on this day (varying to make charts look dynamic)
        num_orders = random.randint(8, 20)
        
        for _ in range(num_orders):
            # Select random table
            tbl = random.choice(tables)
            
            # Select 1 to 3 items
            selected_items = random.sample(food_items, k=random.randint(1, 3))
            
            subtotal = decimal.Decimal('0.00')
            items_to_create = []
            
            for f in selected_items:
                qty = random.randint(1, 2)
                price = decimal.Decimal(str(f.price))
                subtotal += price * qty
                items_to_create.append((f, qty, price))
            
            tax = subtotal * decimal.Decimal('0.05')
            total = subtotal + tax
            
            pay_method = random.choice(payment_methods)
            
            # Earlier days are COMPLETED, today has various statuses
            if day_offset > 0:
                ord_status = 'COMPLETED'
                pay_status = 'PAID'
            else:
                ord_status = random.choice(statuses)
                pay_status = 'PAID' if ord_status in ['COMPLETED', 'SERVED'] else random.choice(['PAID', 'PENDING'])

            # Generate random hour for the order (8 AM to 10 PM)
            order_hour = random.randint(8, 22)
            naive_order_time = order_date.replace(hour=order_hour, minute=random.randint(0, 59), second=0, microsecond=0)
            
            # Already timezone aware because today = timezone.now() is timezone aware
            order_time = naive_order_time

            # Create Order
            order = Order.objects.create(
                table=tbl,
                customer_name=random.choice(["Amit", "Priya", "Rahul", "Neha", "David", "Jessica", "George", "Sara"]),
                customer_phone=f"98765{random.randint(10000, 99999)}",
                special_instructions=random.choice(["", "", "Make it extra spicy", "No sugar", "Serve fast please"]),
                subtotal_amount=subtotal,
                tax_amount=tax,
                total_amount=total,
                payment_method=pay_method,
                payment_status=pay_status,
                order_status=ord_status
            )
            # Override created_at (auto_now_add doesn't let us modify, so we use update query after)
            Order.objects.filter(id=order.id).update(created_at=order_time)
            
            # Create OrderItems
            for f, qty, price in items_to_create:
                OrderItem.objects.create(
                    order=order,
                    food_item=f,
                    quantity=qty,
                    price=price
                )
                
            # Create Payment
            Payment.objects.create(
                order=order,
                payment_method=pay_method,
                payment_status=pay_status,
                amount=total,
                created_at=order_time
            )
            total_seeded_orders += 1
            
    print(f"Created {total_seeded_orders} historical orders across 7 days successfully!")
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_db()

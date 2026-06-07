from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CategoryViewSet, FoodItemViewSet, TableViewSet, CartViewSet,
    OrderViewSet, InventoryViewSet, StaffViewSet, CouponViewSet,
    ReviewViewSet, AnalyticsViewSet, AuthViewSet
)

router = DefaultRouter()
router.register('tables', TableViewSet, basename='table')
router.register('categories', CategoryViewSet, basename='category')
router.register('food-items', FoodItemViewSet, basename='fooditem')
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')
router.register('inventory', InventoryViewSet, basename='inventory')
router.register('staff', StaffViewSet, basename='staff')
router.register('coupons', CouponViewSet, basename='coupon')
router.register('reviews', ReviewViewSet, basename='review')
router.register('analytics', AnalyticsViewSet, basename='analytics')
router.register('auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    # JWT Auth Endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

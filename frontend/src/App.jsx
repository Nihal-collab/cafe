import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Global Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TableSessionSetter from './pages/TableSessionSetter';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import FoodManagement from './pages/FoodManagement';
import OrderManagement from './pages/OrderManagement';
import InventoryManagement from './pages/InventoryManagement';
import StaffManagement from './pages/StaffManagement';
import CouponManagement from './pages/CouponManagement';
import ReviewsManagement from './pages/ReviewsManagement';

// Customer Layout Wrapper
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Table Scanning Route */}
        <Route path="/table/:tableNum" element={<TableSessionSetter />} />

        {/* Customer Routing with Header & Footer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
        </Route>

        {/* Secure Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Secure Admin Dashboard Layout Wrapper */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AnalyticsDashboard />} />
          <Route path="food" element={<FoodManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="reviews" element={<ReviewsManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

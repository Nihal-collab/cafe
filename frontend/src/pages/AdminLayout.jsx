import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart3, UtensilsCrossed, ShoppingBag, Box, Users, Ticket, 
  MessageSquare, LogOut, ShieldAlert, Shield, Coffee, ChevronRight, Menu as MenuIcon, X
} from 'lucide-react';
import api from '../utils/api';
import { logout, setUser } from '../store';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // If not authenticated, redirect to login page immediately
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('auth/me/');
        dispatch(setUser(response.data));
      } catch (err) {
        console.error('Failed to fetch profile info:', err);
        // If JWT token expired or invalid, log out
        dispatch(logout());
        navigate('/admin/login');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Analytics Dashboard', path: '/admin', icon: BarChart3 },
    { name: 'Food Management', path: '/admin/food', icon: UtensilsCrossed },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Inventory Management', path: '/admin/inventory', icon: Box },
    { name: 'Staff Management', path: '/admin/staff', icon: Users },
    { name: 'Offers & Promotions', path: '/admin/coupons', icon: Ticket },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-espresso text-ivory h-16 flex items-center justify-between px-4 z-40 sticky top-0 border-b border-caramel/10">
        <div className="flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-caramel" />
          <span className="font-heading text-lg font-bold tracking-wider">L'Ambroisie</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-ivory/80 focus:outline-none"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static transition-transform duration-300 ease-in-out z-30 w-72 bg-espresso border-r border-caramel/10 flex flex-col justify-between shrink-0 shadow-2xl md:shadow-none`}>
        
        <div className="py-6 px-4 space-y-8">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2">
            <Link to="/" className="flex items-center space-x-2">
              <Coffee className="h-7 w-7 text-caramel animate-pulse" />
              <span className="font-heading text-xl font-bold tracking-widest text-white">
                L'AMBROISIE
              </span>
            </Link>
            <button className="md:hidden text-ivory/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin Info Profile */}
          <div className="bg-coffee/30 border border-caramel/10 rounded-2xl p-4 flex items-center space-x-3">
            <div className="h-10 w-10 bg-caramel/10 border border-caramel/20 rounded-full flex items-center justify-center text-caramel">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-ivory/40 uppercase tracking-widest font-body">Logged In As</span>
              <h4 className="font-body text-xs font-bold text-white tracking-wide truncate">
                {profileLoading ? 'Loading...' : user?.name || user?.username || 'Admin Manager'}
              </h4>
              <span className="inline-block px-1.5 py-0.5 rounded bg-forest/20 text-forest text-[9px] uppercase font-bold font-body mt-0.5">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 font-body text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-medium tracking-wide uppercase transition-all duration-300 ${
                    active
                      ? 'bg-gold-gradient text-espresso font-bold shadow-lg shadow-caramel/10'
                      : 'text-ivory/60 hover:text-white hover:bg-coffee/20'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-caramel/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600/10 border border-red-600/20 text-red-400 font-body text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Dashboard Wrapper */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

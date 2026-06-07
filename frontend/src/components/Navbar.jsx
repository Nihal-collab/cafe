import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Coffee, Menu as MenuIcon, X, ClipboardList, Shield } from 'lucide-react';
import api from '../utils/api';
import { setCartId, setCartData } from '../store';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { itemsCount, cartId } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const activeOrderId = useSelector((state) => state.orderTracking.activeOrderId);

  useEffect(() => {
    // Initial cart load or create
    const fetchCart = async () => {
      try {
        const storedCartId = sessionStorage.getItem('cart_id');
        const response = await api.post('cart/get-or-create/', { cart_id: storedCartId });
        dispatch(setCartId(response.data.id));
        dispatch(setCartData(response.data));
      } catch (err) {
        console.error('Failed to get or create cart:', err);
      }
    };
    fetchCart();
  }, [dispatch]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-caramel" />
              <span className="font-heading text-2xl font-bold tracking-wider text-espresso">
                L'Ambroisie
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/menu"
              className={`font-body text-sm font-medium tracking-wide transition-colors hover:text-caramel ${
                isActive('/menu') ? 'text-caramel border-b-2 border-caramel' : 'text-espresso'
              }`}
            >
              MENU
            </Link>
            
            {/* Track Orders Link */}
            {activeOrderId && (
              <Link
                to={`/order-success/${activeOrderId}`}
                className="flex items-center space-x-1 text-espresso font-body text-sm font-medium tracking-wide hover:text-caramel transition-colors"
                title="Track Active Order"
              >
                <ClipboardList className="h-4 w-4 text-caramel" />
                <span>TRACK ORDER</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-forest text-white animate-pulse">
                  Live
                </span>
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-espresso hover:text-caramel transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-espresso ring-2 ring-white">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Admin Link */}
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              className="flex items-center space-x-1 border border-coffee/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-coffee hover:text-ivory transition-all duration-300"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{isAuthenticated ? 'ADMIN PANEL' : 'ADMIN LOGIN'}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-4">
            {/* Cart Link (always visible) */}
            <Link
              to="/cart"
              className="relative p-2 text-espresso hover:text-caramel transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-espresso ring-2 ring-white">
                  {itemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-espresso hover:text-caramel focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-coffee/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/menu"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-espresso hover:bg-caramel/10 hover:text-caramel"
            >
              Browse Menu
            </Link>
            
            {activeOrderId && (
              <Link
                to={`/order-success/${activeOrderId}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-espresso hover:bg-caramel/10 hover:text-caramel"
              >
                <ClipboardList className="h-5 w-5 text-caramel" />
                <span>Track Active Order</span>
                <span className="px-2 py-0.5 rounded bg-forest text-white text-[10px] uppercase font-bold animate-pulse">
                  Live
                </span>
              </Link>
            )}

            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-espresso hover:bg-caramel/10 hover:text-caramel"
            >
              <Shield className="h-5 w-5 text-coffee" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

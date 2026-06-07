import { configureStore, createSlice } from '@reduxjs/toolkit';

// --- AUTH SLICE (Admin authentication) ---
const initialAuthState = {
  token: localStorage.getItem('admin_token') || null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      state.user = user;
      localStorage.setItem('admin_token', token);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('admin_token');
    },
  },
});

// --- CART SLICE (Customer Guest Cart) ---
const initialCartState = {
  cartId: sessionStorage.getItem('cart_id') || null,
  items: [],
  totalAmount: 0.00,
  itemsCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    setCartId: (state, action) => {
      state.cartId = action.payload;
      if (action.payload) {
        sessionStorage.setItem('cart_id', action.payload);
      } else {
        sessionStorage.removeItem('cart_id');
      }
    },
    setCartData: (state, action) => {
      const { items, total_amount, items_count } = action.payload;
      state.items = items || [];
      state.totalAmount = parseFloat(total_amount) || 0.00;
      state.itemsCount = parseInt(items_count) || 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0.00;
      state.itemsCount = 0;
    },
  },
});

// --- ORDER TRACKING SLICE ---
// Persists ONLY the current active order ID placed by this browser in session storage
const getInitialActiveOrderId = () => {
  return sessionStorage.getItem('active_order_id') || null;
};

const orderTrackingSlice = createSlice({
  name: 'orderTracking',
  initialState: {
    activeOrderId: getInitialActiveOrderId(),
  },
  reducers: {
    setActiveOrderId: (state, action) => {
      state.activeOrderId = action.payload;
      if (action.payload) {
        sessionStorage.setItem('active_order_id', action.payload);
      } else {
        sessionStorage.removeItem('active_order_id');
      }
    },
    clearActiveOrderId: (state) => {
      state.activeOrderId = null;
      sessionStorage.removeItem('active_order_id');
    }
  }
});

// Export actions
export const { setCredentials, setUser, logout } = authSlice.actions;
export const { setCartId, setCartData, clearCart } = cartSlice.actions;
export const { setActiveOrderId, clearActiveOrderId } = orderTrackingSlice.actions;

// Create and export store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    orderTracking: orderTrackingSlice.reducer,
  },
});

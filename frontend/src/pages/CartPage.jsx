import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Ticket, CreditCard, User, Phone, Clipboard, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { setCartData, clearCart, setActiveOrderId } from '../store';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cartId, items, totalAmount } = useSelector((state) => state.cart);

  // Customer checkout details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE', 'COUNTER', 'WAITER'

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Loading Checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Read table number from sessionStorage if scanned from QR Code
  useEffect(() => {
    const storedTableNum = sessionStorage.getItem('table_number');
    if (storedTableNum) {
      setTableNumber(storedTableNum);
    }
  }, []);

  const handleUpdateQuantity = async (foodItemId, newQty) => {
    try {
      const response = await api.post(`cart/${cartId}/update-item-quantity/`, {
        food_item_id: foodItemId,
        quantity: newQty
      });
      dispatch(setCartData(response.data));
    } catch (err) {
      console.error('Failed to update item quantity:', err);
    }
  };

  const handleRemoveItem = async (foodItemId) => {
    try {
      const response = await api.post(`cart/${cartId}/remove-item/`, {
        food_item_id: foodItemId
      });
      dispatch(setCartData(response.data));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await api.post(`cart/${cartId}/clear/`);
      dispatch(setCartData(response.data));
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const response = await api.post('coupons/validate/', {
        code: couponCode.trim().toUpperCase(),
        amount: totalAmount
      });
      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setCouponError('');
      } else {
        setCouponError(response.data.message);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'PERCENTAGE') {
      return totalAmount * (parseFloat(appliedCoupon.discount_value) / 100);
    } else {
      return parseFloat(appliedCoupon.discount_value);
    }
  };

  const getTax = () => {
    const subtotalAfterDiscount = Math.max(0, totalAmount - calculateDiscount());
    return subtotalAfterDiscount * 0.05; // 5% CGST/SGST
  };

  const getFinalTotal = () => {
    const subtotalAfterDiscount = Math.max(0, totalAmount - calculateDiscount());
    return subtotalAfterDiscount + getTax();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      const payload = {
        cart_id: cartId,
        customer_name: customerName,
        customer_phone: customerPhone,
        table_number: tableNumber ? parseInt(tableNumber) : null,
        special_instructions: specialInstructions,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      };

      const response = await api.post('orders/', payload);
      const order = response.data;
      
      // Save order token in store for tracking
      dispatch(setActiveOrderId(order.id));

      // Clear local cart
      dispatch(clearCart());

      // Redirect to success tracking screen
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      alert(err.response?.data?.error || 'Failed to place order. Please review details.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-ivory px-4 space-y-4">
        <div className="h-16 w-16 bg-coffee/5 text-coffee/30 rounded-2xl flex items-center justify-center">
          <Trash2 className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-espresso">Your Cart is Empty</h2>
        <p className="font-body text-xs text-coffee/50 max-w-sm text-center">
          You haven't added any items to your ordering board yet. Head to our menu and explore our artisanal selections.
        </p>
        <Link
          to="/menu"
          className="px-6 py-3 bg-coffee text-ivory rounded-xl text-xs font-body font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/menu"
          className="inline-flex items-center space-x-1.5 text-xs font-body font-bold text-coffee/60 hover:text-caramel uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Browsing</span>
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-espresso mb-8">
          YOUR ORDER BOARD
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-coffee/5 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-coffee/5 flex justify-between items-center bg-coffee/[0.02]">
                <h3 className="font-heading text-lg font-bold text-espresso">Selected Items</h3>
                <button
                  onClick={handleClearCart}
                  className="font-body text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                >
                  Clear Board
                </button>
              </div>

              <div className="divide-y divide-coffee/5">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Info */}
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-coffee/5 shrink-0">
                        <img
                          src={item.food_item_details.image}
                          alt={item.food_item_details.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-body font-bold text-sm text-espresso">
                          {item.food_item_details.name}
                        </h4>
                        <p className="font-body text-xs text-coffee/50">
                          Rs. {parseFloat(item.food_item_details.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifier & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end space-x-8">
                      <div className="flex items-center space-x-3 bg-ivory/50 border border-coffee/10 px-3 py-1.5 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.food_item, item.quantity - 1)}
                          className="text-coffee/60 hover:text-caramel transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-body text-sm font-bold text-espresso min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.food_item, item.quantity + 1)}
                          className="text-coffee/60 hover:text-caramel transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-body text-sm font-bold text-espresso min-w-[80px] text-right">
                          Rs. {parseFloat(item.subtotal).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.food_item)}
                          className="text-coffee/30 hover:text-red-600 transition-colors p-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-6">
              <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
                Diner Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60 flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-caramel" />
                    <span>Your Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-sm font-body text-espresso placeholder-coffee/30 focus:outline-none focus:border-caramel"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60 flex items-center space-x-1.5">
                    <Phone className="h-3.5 w-3.5 text-caramel" />
                    <span>Phone Number (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-sm font-body text-espresso placeholder-coffee/30 focus:outline-none focus:border-caramel"
                  />
                </div>

                {/* Table Number */}
                <div className="space-y-2">
                  <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60 flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-caramel" />
                    <span>Table Number</span>
                  </label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="E.g. 5"
                    required
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-sm font-body text-espresso placeholder-coffee/30 focus:outline-none focus:border-caramel"
                  />
                  <p className="font-body text-[10px] text-coffee/40">
                    If scanned from table QR code, this is auto-populated. Otherwise, please enter manually.
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60 flex items-center space-x-1.5">
                    <Clipboard className="h-3.5 w-3.5 text-caramel" />
                    <span>Special Instructions (Optional)</span>
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="E.g. Make it extra hot, no onions, etc."
                    rows="3"
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-sm font-body text-espresso placeholder-coffee/30 focus:outline-none focus:border-caramel resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout & Summary Panel */}
          <div className="space-y-6">
            {/* Coupon Application Panel */}
            <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
              <h4 className="font-heading text-base font-bold text-espresso flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-caramel" />
                <span>Apply Offers</span>
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs font-body text-espresso uppercase placeholder-coffee/30 focus:outline-none focus:border-caramel"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode}
                  className="px-4 py-3 bg-coffee text-ivory rounded-xl text-xs font-body font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p className="font-body text-[10px] text-red-600 font-semibold">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="bg-forest/10 border border-forest/20 rounded-xl p-3 flex justify-between items-center text-xs font-body">
                  <div>
                    <span className="font-bold text-forest uppercase block">{appliedCoupon.code} Applied</span>
                    <span className="text-coffee/60">
                      Discount of {appliedCoupon.discount_type === 'PERCENTAGE' ? `${parseFloat(appliedCoupon.discount_value)}%` : `Rs. ${parseFloat(appliedCoupon.discount_value)}`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Invoice Bill Card */}
            <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-6">
              <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
                Bill Summary
              </h3>

              <div className="space-y-3 font-body text-sm text-coffee/80">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-forest font-semibold">
                    <span>Discount Coupon ({appliedCoupon.code})</span>
                    <span>- Rs. {calculateDiscount().toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes & Service (5%)</span>
                  <span>Rs. {getTax().toFixed(2)}</span>
                </div>

                <div className="border-t border-coffee/5 pt-4 flex justify-between text-base font-bold text-espresso">
                  <span>Total Amount</span>
                  <span className="text-caramel">Rs. {getFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-3 border-t border-coffee/5 pt-6">
                <h4 className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60 flex items-center space-x-1.5">
                  <CreditCard className="h-4 w-4 text-caramel" />
                  <span>Choose Payment Method</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center font-body text-xs">
                  {[
                    { key: 'ONLINE', label: 'Pay Online' },
                    { key: 'COUNTER', label: 'Counter Cash' },
                    { key: 'WAITER', label: 'Pay to Waiter' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`py-3 px-2 rounded-xl font-bold uppercase transition-all duration-300 border ${
                        paymentMethod === method.key
                          ? 'bg-coffee border-coffee text-ivory shadow-md'
                          : 'bg-white border-coffee/10 text-espresso hover:bg-ivory/30'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
                <p className="font-body text-[10px] text-coffee/40 leading-relaxed pt-1 text-center">
                  *Payment is NOT mandatory to place orders. You can order immediately and pay at your convenience.
                </p>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !tableNumber}
                className="w-full py-4 bg-gold-gradient text-espresso font-body text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{checkoutLoading ? 'PLACING ORDER...' : 'PLACE ORDER'}</span>
              </button>
              {!tableNumber && (
                <p className="font-body text-[10px] text-red-500 text-center font-semibold">
                  *Please provide your Table Number to place order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

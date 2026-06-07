import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Coffee, Clock, Heart, Award, Star, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { useDispatch, useSelector } from 'react-redux';
import { clearActiveOrderId, setCartId, setCartData, clearCart } from '../store';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const activeOrderId = useSelector((state) => state.orderTracking.activeOrderId);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews states
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Poll Order status every 5 seconds
  const fetchOrderDetails = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get(`orders/${orderId}/`);
      setOrder(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to get order details:', err);
      setError('Could not retrieve order tracking data.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Session isolation check
    if (orderId && String(orderId) !== String(activeOrderId)) {
      setLoading(false);
      setError('Access Denied: You do not have permission to view this order.');
      return;
    }

    fetchOrderDetails(true);

    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, activeOrderId]);

  const handleStartNewOrder = async () => {
    try {
      dispatch(clearCart());
      dispatch(clearActiveOrderId());

      sessionStorage.removeItem('cart_id');
      sessionStorage.removeItem('table_number');
      sessionStorage.removeItem('active_order_id');

      const response = await api.post('cart/get-or-create/');
      dispatch(setCartId(response.data.id));
      dispatch(setCartData(response.data));

      navigate('/menu');
    } catch (err) {
      console.error('Failed to start a new order:', err);
      navigate('/menu');
    }
  };

  const handleOpenReview = (foodItem) => {
    setSelectedFoodItem(foodItem);
    setRating(5);
    setReviewComment('');
    setReviewSubmitted(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedFoodItem) return;
    setReviewLoading(true);
    try {
      await api.post('reviews/', {
        food_item: selectedFoodItem.id,
        customer_name: order.customer_name || 'Valued Guest',
        rating: rating,
        comment: reviewComment,
        is_approved: true // Auto approved for demo
      });
      setReviewSubmitted(true);
      // Refresh order to update review count indicator if needed
      setTimeout(() => setSelectedFoodItem(null), 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Could not submit review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-caramel border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-body text-espresso font-medium text-sm">Loading Order Tracking Board...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const isAccessDenied = error && error.includes('Access Denied');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory text-center px-4 space-y-4">
        <h2 className="font-heading text-2xl font-bold text-red-600">
          {isAccessDenied ? 'Access Denied' : 'Order Not Found'}
        </h2>
        <p className="font-body text-xs text-coffee/60 max-w-sm">
          {error || "We couldn't resolve this order ID. It might be invalid or deleted."}
        </p>
        {isAccessDenied ? (
          <button
            onClick={handleStartNewOrder}
            className="px-6 py-3 bg-coffee text-ivory rounded-xl text-xs font-body font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300"
          >
            Start New Order
          </button>
        ) : (
          <Link
            to="/menu"
            className="px-6 py-3 bg-coffee text-ivory rounded-xl text-xs font-body font-bold uppercase tracking-wider"
          >
            Browse Menu
          </Link>
        )}
      </div>
    );
  }

  // Calculate prep time: sum of prep times + wait buffer
  const getPrepTime = () => {
    // Basic estimation
    if (order.items && order.items.length > 0) {
      const maxItemTime = Math.max(...order.items.map(i => i.food_item_details?.prep_time || 15));
      return maxItemTime + 5; // adding 5 mins buffer
    }
    return 20;
  };

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Success Message Panel */}
        <div className="bg-white rounded-3xl border border-coffee/5 p-8 text-center shadow-premium space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-forest animate-bounce" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-espresso tracking-wide">
            ORDER PLACED SUCCESSFULLY
          </h1>
          <p className="font-body text-xs text-coffee/60 max-w-md mx-auto leading-relaxed">
            Thank you for dining with L'Ambroisie! Your order has been registered and is being processed by the kitchen crew.
          </p>
          <div className="inline-flex gap-4 items-center bg-ivory/50 border border-coffee/10 px-4 py-2 rounded-xl text-xs font-body font-semibold">
            <span>Order ID: <strong className="text-espresso">#{order.id}</strong></span>
            <span className="w-1.5 h-1.5 bg-coffee/20 rounded-full"></span>
            <span>Table: <strong className="text-espresso">{order.table_number || 'Takeaway'}</strong></span>
          </div>
        </div>

        {/* 2. Order Tracking Stepper */}
        <OrderStatusTracker status={order.order_status} />

        {/* 3. Details Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Items Receipt List */}
          <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium md:col-span-2 space-y-4">
            <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
              Order Receipt
            </h3>
            
            <div className="divide-y divide-coffee/5">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-body text-xs font-bold text-caramel shrink-0 bg-caramel/10 h-6 w-6 rounded-full flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <div>
                      <h4 className="font-body font-bold text-sm text-espresso">
                        {item.food_item_details?.name || 'Item'}
                      </h4>
                      <p className="font-body text-[10px] text-coffee/40">
                        {item.food_item_details?.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-body text-xs text-coffee/60 font-semibold">
                      Rs. {parseFloat(item.subtotal).toFixed(2)}
                    </span>
                    {order.order_status === 'COMPLETED' && (
                      <button
                        onClick={() => handleOpenReview(item.food_item_details)}
                        className="text-caramel hover:text-coffee transition-colors font-body text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 border border-caramel/20 px-2 py-1 rounded"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-coffee/5 pt-4 space-y-2 text-xs font-body text-coffee/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {parseFloat(order.subtotal_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST / Taxes (5%)</span>
                <span>Rs. {parseFloat(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-espresso pt-2 border-t border-coffee/5">
                <span>Total Bill</span>
                <span className="text-caramel">Rs. {parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-coffee/5 p-6 shadow-premium space-y-4">
              <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
                Details
              </h3>

              <div className="space-y-4 font-body text-xs text-coffee/80">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-caramel shrink-0" />
                  <div>
                    <span className="text-coffee/40 block">Estimated Prep Time</span>
                    <strong className="text-espresso font-semibold text-sm">{getPrepTime()} Minutes</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Coffee className="h-5 w-5 text-caramel shrink-0" />
                  <div>
                    <span className="text-coffee/40 block">Payment Method</span>
                    <strong className="text-espresso font-semibold text-sm">
                      {order.payment_method === 'ONLINE' ? 'Pay Online' : order.payment_method === 'COUNTER' ? 'Pay At Counter' : 'Pay To Waiter'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-caramel shrink-0" />
                  <div>
                    <span className="text-coffee/40 block">Payment Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.payment_status === 'PAID' ? 'bg-forest/10 text-forest' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {order.payment_status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Start New Order Button */}
            <button
              onClick={handleStartNewOrder}
              className="w-full py-4 bg-gold-gradient text-espresso font-body text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
            >
              Start New Order
            </button>
          </div>
        </div>

        {/* 4. Review Dialog Form Overlay */}
        {selectedFoodItem && (
          <div className="fixed inset-0 bg-espresso/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-coffee/5 shadow-2xl relative space-y-4">
              <h3 className="font-heading text-xl font-bold text-espresso border-b border-coffee/5 pb-3">
                Review {selectedFoodItem.name}
              </h3>

              {reviewSubmitted ? (
                <div className="text-center py-6 space-y-2 text-forest">
                  <CheckCircle2 className="h-12 w-12 mx-auto" />
                  <p className="font-body text-sm font-bold">Review Submitted Successfully!</p>
                  <p className="font-body text-xs text-coffee/50">Your review helps improve our gourmet quality.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating selection */}
                  <div className="space-y-2">
                    <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-yellow-500 transition-transform hover:scale-110"
                        >
                          <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : 'text-coffee/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Comments</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows="4"
                      required
                      className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-sm font-body text-espresso focus:outline-none focus:border-caramel resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFoodItem(null)}
                      className="px-4 py-2 border border-coffee/10 rounded-lg font-body text-xs font-bold text-coffee hover:bg-ivory/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="px-4 py-2 bg-coffee text-ivory rounded-lg font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;

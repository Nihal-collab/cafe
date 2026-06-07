import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Clock, Check, Utensils, Ban, ClipboardCheck } from 'lucide-react';
import api from '../utils/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'

  const loadOrders = async () => {
    setLoading(true);
    try {
      let url = 'orders/';
      const params = [];
      if (activeTab !== 'ALL') {
        params.push(`status=${activeTab}`);
      }
      if (searchQuery) {
        params.push(`search=${searchQuery}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      const response = await api.get(url);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Poll orders every 10 seconds for admin live updates
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, searchQuery]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`orders/${orderId}/update-status/`, {
        status: newStatus
      });
      loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'RECEIVED', label: 'New/Pending' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Live Order Manager</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Accept and track customer orders</p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center space-x-1 border border-coffee/10 px-4 py-2 bg-white rounded-xl text-xs font-body font-bold uppercase tracking-wider text-espresso hover:bg-ivory/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-4">
        <div className="max-w-md bg-white rounded-xl border border-coffee/5 p-2 shadow-premium">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-coffee/40" />
            <input
              type="text"
              placeholder="Search by customer name or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivory/20 border-0 rounded-lg text-xs font-body text-espresso placeholder-coffee/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl font-body text-xs font-bold uppercase tracking-wider whitespace-nowrap border ${
                activeTab === tab.key
                  ? 'bg-coffee border-coffee text-ivory shadow-sm'
                  : 'bg-white border-coffee/5 text-coffee hover:bg-caramel/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-coffee/5 p-16 text-center space-y-2 max-w-lg mx-auto shadow-premium">
          <ClipboardCheck className="h-10 w-10 text-coffee/20 mx-auto" />
          <h4 className="font-heading text-lg font-bold text-espresso">No Orders Found</h4>
          <p className="font-body text-xs text-coffee/50">There are no orders in this category at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`bg-white rounded-2xl border border-coffee/5 overflow-hidden shadow-premium flex flex-col justify-between ${
                order.order_status === 'RECEIVED' ? 'border-l-4 border-l-caramel' :
                order.order_status === 'PREPARING' ? 'border-l-4 border-l-coffee' :
                order.order_status === 'READY' ? 'border-l-4 border-l-forest' : ''
              }`}
            >
              {/* Header Details */}
              <div className="p-5 border-b border-coffee/5 bg-coffee/[0.01]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading text-base font-bold text-espresso">Order #{order.id}</h3>
                    <span className="font-body text-[10px] text-coffee/40">
                      Table {order.table_number || 'Takeaway'} | {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-body ${
                    order.order_status === 'RECEIVED' ? 'bg-caramel/10 text-caramel' :
                    order.order_status === 'PREPARING' ? 'bg-coffee/10 text-coffee' :
                    order.order_status === 'READY' ? 'bg-forest/10 text-forest' :
                    order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-coffee/5 text-coffee/40'
                  }`}>
                    {order.order_status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="mt-3 font-body text-xs text-coffee/70">
                  <div className="font-semibold text-espresso">Customer: {order.customer_name || 'Guest'}</div>
                  {order.customer_phone && <div className="text-[10px] text-coffee/50">Phone: {order.customer_phone}</div>}
                  {order.special_instructions && (
                    <div className="bg-yellow-50 border border-yellow-100 text-[10px] text-yellow-800 p-2 rounded-lg mt-2 font-body font-medium italic">
                      Note: {order.special_instructions}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 space-y-2 font-body text-xs text-coffee/80 divide-y divide-coffee/5">
                {order.items && order.items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                    <span>{item.quantity}x {item.food_item_details?.name || 'Deleted Item'}</span>
                    <span className="text-coffee/40">Rs.{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Bill & Actions */}
              <div className="p-5 border-t border-coffee/5 bg-coffee/[0.01] space-y-4">
                <div className="flex justify-between items-center text-xs font-body">
                  <span className="text-coffee/40">Payment: {order.payment_method}</span>
                  <span className="font-bold text-espresso text-sm">Total: Rs.{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>

                {/* Status controllers */}
                <div className="flex gap-2">
                  {order.order_status === 'RECEIVED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-coffee text-ivory rounded-lg text-xs font-bold uppercase hover:bg-caramel hover:text-espresso transition-all duration-300"
                      >
                        <Utensils className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
                        title="Cancel Order"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  {order.order_status === 'PREPARING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-caramel text-espresso rounded-lg text-xs font-bold uppercase hover:bg-coffee hover:text-white transition-all duration-300"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    </>
                  )}

                  {order.order_status === 'READY' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-forest text-white rounded-lg text-xs font-bold uppercase hover:bg-coffee hover:text-white transition-all duration-300"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark Served</span>
                      </button>
                    </>
                  )}

                  {order.order_status === 'SERVED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="w-full py-2.5 bg-coffee text-ivory rounded-lg text-xs font-bold uppercase hover:bg-caramel hover:text-espresso transition-all duration-300"
                      >
                        <span>Complete Order</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

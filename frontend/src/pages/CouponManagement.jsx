import React, { useEffect, useState } from 'react';
import { Plus, Ticket, Calendar, Trash2 } from 'lucide-react';
import api from '../utils/api';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_amount: '0.00',
    active: true,
    valid_from: '',
    valid_to: ''
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('coupons/');
      setCoupons(response.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggleActive = async (item) => {
    try {
      await api.patch(`coupons/${item.id}/`, {
        active: !item.active
      });
      loadCoupons();
    } catch (err) {
      console.error('Failed to update coupon status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.delete(`coupons/${id}/`);
      loadCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Formatting date-time for API
      const payload = {
        ...newCoupon,
        discount_value: parseFloat(newCoupon.discount_value),
        min_order_amount: parseFloat(newCoupon.min_order_amount),
        valid_from: new Date(newCoupon.valid_from).toISOString(),
        valid_to: new Date(newCoupon.valid_to).toISOString()
      };

      await api.post('coupons/', payload);
      setModalOpen(false);
      setNewCoupon({
        code: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_amount: '0.00',
        active: true,
        valid_from: '',
        valid_to: ''
      });
      loadCoupons();
    } catch (err) {
      console.error('Failed to add coupon:', err);
      alert('Error saving coupon. Verify start date is before end date.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Offers & Coupons</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Manage cafe discounts and promotions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-coffee text-ivory px-5 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className={`bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex flex-col justify-between relative ${
                !coupon.active ? 'opacity-60 bg-coffee/[0.01]' : ''
              }`}
            >
              {/* Header Icon */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-caramel/10 border border-caramel/20 rounded-xl flex items-center justify-center text-caramel shrink-0">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-espresso tracking-wide">{coupon.code}</h4>
                    <span className="font-body text-[10px] text-coffee/40 uppercase">
                      {coupon.discount_type === 'PERCENTAGE' ? `${parseFloat(coupon.discount_value)}% Off` : `Rs. ${parseFloat(coupon.discount_value)} Off`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="text-coffee/20 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Validity Details */}
              <div className="mt-4 pt-4 border-t border-coffee/5 font-body text-xs text-coffee/60 space-y-2">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <strong className="text-espresso">Rs. {parseFloat(coupon.min_order_amount).toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1"><Calendar className="h-3.5 w-3.5 text-caramel" /> <span>Valid Until:</span></span>
                  <span className="text-[10px] text-espresso font-semibold">{new Date(coupon.valid_to).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-coffee/5 flex justify-between items-center text-[10px] font-body">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  coupon.is_valid ? 'bg-forest/10 text-forest' : 'bg-red-100 text-red-700'
                }`}>
                  {coupon.is_valid ? 'Valid & Active' : 'Expired/Inactive'}
                </span>
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className="text-caramel hover:text-coffee font-bold uppercase tracking-wider"
                >
                  Toggle Active
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-coffee/5 shadow-2xl relative space-y-4">
            <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
              Create Discount Coupon
            </h3>

            <form onSubmit={handleSave} className="space-y-4 font-body text-xs text-coffee/80">
              {/* Code */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. WELCOME20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso uppercase focus:outline-none"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Discount Type</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>
              </div>

              {/* Min Order */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Minimum Order Amount (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newCoupon.min_order_amount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Valid From</label>
                  <input
                    type="datetime-local"
                    required
                    value={newCoupon.valid_from}
                    onChange={(e) => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Valid To</label>
                  <input
                    type="datetime-local"
                    required
                    value={newCoupon.valid_to}
                    onChange={(e) => setNewCoupon({ ...newCoupon, valid_to: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 justify-end pt-4 border-t border-coffee/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-coffee/10 rounded-lg font-body text-xs font-bold text-coffee hover:bg-ivory/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-coffee text-ivory rounded-lg font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;

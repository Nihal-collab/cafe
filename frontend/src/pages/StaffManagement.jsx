import React, { useEffect, useState } from 'react';
import { Plus, User, Shield, Users } from 'lucide-react';
import api from '../utils/api';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'WAITER', phone: '', is_active: true });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('staff/');
      setStaffList(response.data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleToggleActive = async (item) => {
    try {
      await api.patch(`staff/${item.id}/`, {
        is_active: !item.is_active
      });
      loadStaff();
    } catch (err) {
      console.error('Failed to update staff status:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('staff/', newStaff);
      setModalOpen(false);
      setNewStaff({ name: '', role: 'WAITER', phone: '', is_active: true });
      loadStaff();
    } catch (err) {
      console.error('Failed to add staff member:', err);
      alert('Error adding staff. Make sure input is correct.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Staff Roster</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Manage cafe waiters and kitchen crews</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-coffee text-ivory px-5 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div 
              key={staff.id} 
              className={`bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex items-center space-x-4 relative ${
                !staff.is_active ? 'opacity-60 bg-coffee/[0.01]' : ''
              }`}
            >
              {/* Profile icon placeholder */}
              <div className="h-12 w-12 bg-caramel/10 border border-caramel/20 rounded-xl flex items-center justify-center text-caramel shrink-0">
                {staff.role === 'ADMIN' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
              </div>

              {/* Staff Details */}
              <div className="flex-1 min-w-0 text-xs font-body space-y-1">
                <h4 className="font-heading text-sm font-bold text-espresso truncate">{staff.name}</h4>
                <div className="text-caramel font-semibold uppercase tracking-wide text-[10px]">
                  {staff.role_display}
                </div>
                {staff.phone && <div className="text-coffee/50">Phone: {staff.phone}</div>}
                <div className="pt-2 flex items-center justify-between">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    staff.is_active ? 'bg-forest/10 text-forest' : 'bg-coffee/10 text-coffee/40'
                  }`}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(staff)}
                    className="text-caramel hover:text-coffee hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    Toggle Status
                  </button>
                </div>
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
              Add Staff Member
            </h3>

            <form onSubmit={handleSave} className="space-y-4 font-body text-xs text-coffee/80">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="E.g. Robert Smith"
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Phone Number</label>
                <input
                  type="text"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="E.g. 9998887770"
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                >
                  <option value="WAITER">Waiter</option>
                  <option value="KITCHEN">Kitchen Staff</option>
                  <option value="ADMIN">Admin Manager</option>
                </select>
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, AlertCircle, RefreshCw, Box } from 'lucide-react';
import api from '../utils/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', quantity: '', unit: 'kg', low_stock_threshold: '' });
  const [isEdit, setIsEdit] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('inventory/');
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentItem({ id: null, name: '', quantity: '', unit: 'kg', low_stock_threshold: '5.00' });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentItem({
      id: item.id,
      name: item.name,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      low_stock_threshold: parseFloat(item.low_stock_threshold)
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentItem.name,
        quantity: parseFloat(currentItem.quantity),
        unit: currentItem.unit,
        low_stock_threshold: parseFloat(currentItem.low_stock_threshold)
      };

      if (isEdit) {
        await api.put(`inventory/${currentItem.id}/`, payload);
      } else {
        await api.post('inventory/', payload);
      }
      setModalOpen(false);
      loadInventory();
    } catch (err) {
      console.error('Failed to save inventory:', err);
      alert('Error saving stock. Ensure item name is unique.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ingredient from stock list?')) return;
    try {
      await api.delete(`inventory/${id}/`);
      loadInventory();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Inventory & Stock</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Manage kitchen raw ingredients</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadInventory}
            className="p-3 border border-coffee/10 bg-white rounded-xl text-espresso hover:bg-ivory/50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 bg-coffee text-ivory px-5 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Inventory List */}
      {loading ? (
        <div className="h-64 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-coffee/5 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs border-collapse">
              <thead>
                <tr className="border-b border-coffee/10 text-coffee/50 font-bold uppercase tracking-wider bg-coffee/[0.01]">
                  <th className="p-4">Ingredient Name</th>
                  <th className="p-4 text-center">Current Stock</th>
                  <th className="p-4 text-center">Low Stock Alert Level</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee/5">
                {inventory.map((item) => (
                  <tr key={item.id} className={`hover:bg-ivory/20 ${item.status === 'LOW_STOCK' ? 'bg-red-500/[0.01]' : ''}`}>
                    <td className="p-4 font-semibold text-espresso">{item.name}</td>
                    <td className="p-4 text-center font-bold text-espresso">
                      {parseFloat(item.quantity).toFixed(2)} {item.unit}
                    </td>
                    <td className="p-4 text-center text-coffee/60">
                      {parseFloat(item.low_stock_threshold).toFixed(2)} {item.unit}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        item.status === 'LOW_STOCK' 
                          ? 'bg-red-100 text-red-700 animate-pulse' 
                          : 'bg-forest/10 text-forest'
                      }`}>
                        {item.status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center space-x-1 border border-coffee/10 px-2.5 py-1.5 rounded-lg text-espresso hover:bg-coffee hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Update</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center space-x-1 border border-red-600/10 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-coffee/5 shadow-2xl relative space-y-4">
            <h3 className="font-heading text-lg font-bold text-espresso border-b border-coffee/5 pb-3">
              {isEdit ? 'Update Stock Quantity' : 'Add Ingredient to List'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 font-body text-xs text-coffee/80">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Ingredient Name</label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Unit</label>
                  <select
                    value={currentItem.unit}
                    onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                    className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="grams">Grams (g)</option>
                    <option value="liters">Liters (l)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
              </div>

              {/* Threshold */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-coffee/60">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={currentItem.low_stock_threshold}
                  onChange={(e) => setCurrentItem({ ...currentItem, low_stock_threshold: e.target.value })}
                  className="w-full p-3 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                />
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;

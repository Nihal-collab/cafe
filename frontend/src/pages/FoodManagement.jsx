import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Sparkles } from 'lucide-react';
import api from '../utils/api';

const FoodManagement = () => {
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_veg: true,
    prep_time: 15,
    is_available: true,
    is_bestseller: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        api.get('categories/'),
        api.get('food-items/')
      ]);
      setCategories(catsRes.data);
      setFoodItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async (item) => {
    try {
      await api.post(`food-items/${item.id}/update-status/`, {
        status: item.is_available ? 'false' : 'true'  // toggle value
      });
      // We can also patch directly
      await api.patch(`food-items/${item.id}/`, {
        is_available: !item.is_available
      });
      loadData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.delete(`food-items/${id}/`);
      loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentItem({
      id: null,
      name: '',
      description: '',
      price: '',
      category: categories[0]?.id || '',
      image: '',
      is_veg: true,
      prep_time: 15,
      is_available: true,
      is_bestseller: false
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setCurrentItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      category: item.category,
      image: item.image,
      is_veg: item.is_veg,
      prep_time: item.prep_time,
      is_available: item.is_available,
      is_bestseller: item.is_bestseller
    });
    setModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentItem,
        price: parseFloat(currentItem.price),
        prep_time: parseInt(currentItem.prep_time)
      };

      if (isEditMode) {
        await api.put(`food-items/${currentItem.id}/`, payload);
      } else {
        await api.post('food-items/', payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save food item:', err);
      alert('Error saving food item. Make sure all fields are valid.');
    }
  };

  const filteredItems = foodItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Menu & Food Items</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Manage cafe cuisines</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-coffee text-ivory px-5 py-3 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-caramel hover:text-espresso transition-all duration-300 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md bg-white rounded-xl border border-coffee/5 p-2 shadow-premium">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-coffee/40" />
          <input
            type="text"
            placeholder="Search items by name, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-ivory/20 border-0 rounded-lg text-xs font-body text-espresso placeholder-coffee/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Food Items List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-80 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-coffee/5 p-16 text-center space-y-2 max-w-lg mx-auto shadow-premium">
          <Search className="h-10 w-10 text-coffee/20 mx-auto" />
          <h4 className="font-heading text-lg font-bold text-espresso">No Food Items Found</h4>
          <p className="font-body text-xs text-coffee/50">Try searching for another term or click "Add New Dish" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl border border-coffee/5 overflow-hidden shadow-premium flex flex-col relative transition-all duration-300 ${
                !item.is_available ? 'border-red-600/20 bg-red-500/[0.01]' : ''
              }`}
            >
              {/* Image */}
              <div className="h-40 bg-coffee/5 overflow-hidden relative">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 right-3 text-[10px] font-bold font-body px-2 py-0.5 rounded-full ${
                  item.is_veg ? 'bg-forest/10 text-forest border border-forest/20' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {item.is_veg ? 'Veg' : 'Non-Veg'}
                </span>
                {item.is_bestseller && (
                  <span className="absolute top-3 left-3 bg-gold-gradient text-espresso text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-4 flex flex-col flex-1 space-y-2 text-xs font-body">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="font-heading text-sm font-bold text-espresso line-clamp-1">{item.name}</h4>
                  <span className="font-bold text-caramel">Rs.{parseFloat(item.price).toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-coffee/40 uppercase tracking-widest">{item.category_name}</span>
                <p className="text-coffee/60 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                <div className="text-[10px] text-coffee/50">Prep time: {item.prep_time} mins</div>

                {/* Actions Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-coffee/5">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    title={item.is_available ? 'Make Unavailable' : 'Make Available'}
                    className={`flex items-center justify-center p-2 rounded-lg transition-colors border ${
                      item.is_available 
                        ? 'bg-forest/10 border-forest/20 text-forest hover:bg-forest hover:text-white' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    {item.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    title="Edit Item"
                    className="flex items-center justify-center p-2 rounded-lg border border-coffee/10 text-espresso hover:bg-coffee hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete Item"
                    className="flex items-center justify-center p-2 rounded-lg border border-red-600/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-coffee/5 shadow-2xl relative space-y-4">
            <h3 className="font-heading text-xl font-bold text-espresso border-b border-coffee/5 pb-3 flex items-center space-x-1.5">
              <Sparkles className="h-5 w-5 text-caramel" />
              <span>{isEditMode ? 'Edit Food Item' : 'Add New Food Item'}</span>
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 font-body text-xs text-coffee/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Name</label>
                  <input
                    type="text"
                    required
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Category</label>
                  <select
                    value={currentItem.category}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Prep Time */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    value={currentItem.prep_time}
                    onChange={(e) => setCurrentItem({ ...currentItem, prep_time: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/food.jpg"
                    value={currentItem.image}
                    onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-coffee/60">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    className="w-full p-2.5 bg-ivory/20 border border-coffee/10 rounded-xl text-xs text-espresso focus:outline-none resize-none"
                  />
                </div>

                {/* Veg / Bestseller Checkboxes */}
                <div className="flex space-x-6 md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={currentItem.is_veg}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_veg: e.target.checked })}
                      className="rounded border-coffee/20 text-caramel focus:ring-0"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={currentItem.is_bestseller}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_bestseller: e.target.checked })}
                      className="rounded border-coffee/20 text-caramel focus:ring-0"
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={currentItem.is_available}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_available: e.target.checked })}
                      className="rounded border-coffee/20 text-caramel focus:ring-0"
                    />
                    <span>Available</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
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

export default FoodManagement;

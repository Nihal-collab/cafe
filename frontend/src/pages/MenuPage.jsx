import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, Check, RefreshCw, Sparkles } from 'lucide-react';
import api from '../utils/api';
import FoodCard from '../components/FoodCard';
import { setCartId, setCartData } from '../store';

const MenuPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { cartId } = useSelector((state) => state.cart);
  
  // URL Table Detection banner
  const [tableAlert, setTableAlert] = useState(null);

  // Categories & FoodItems states
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_asc', 'price_desc', 'popularity'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    // Check if redirect from TableSessionSetter has table data
    if (location.state?.tableDetected) {
      setTableAlert(`Table ${location.state.tableDetected} successfully detected!`);
      // Auto fade out alert after 5 secs
      const timer = setTimeout(() => setTableAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Load Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load Food Items based on filters
  const loadFoodItems = async () => {
    setLoading(true);
    try {
      let url = 'food-items/?is_available=true';
      if (activeCategory !== 'all') {
        url += `&category=${activeCategory}`;
      }
      if (vegFilter === 'veg') {
        url += '&is_veg=true';
      } else if (vegFilter === 'non-veg') {
        url += '&is_veg=false';
      }
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      if (sortBy !== 'default') {
        url += `&sort_by=${sortBy}`;
      }

      const response = await api.get(url);
      setFoodItems(response.data);
    } catch (err) {
      console.error('Failed to load food items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadFoodItems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, vegFilter, searchQuery, sortBy]);

  const handleAddToCart = async (item) => {
    try {
      let currentCartId = cartId || sessionStorage.getItem('cart_id');
      if (!currentCartId || currentCartId === 'null' || currentCartId === 'undefined') {
        const getOrCreateRes = await api.post('cart/get-or-create/');
        currentCartId = getOrCreateRes.data.id;
        dispatch(setCartId(currentCartId));
        dispatch(setCartData(getOrCreateRes.data));
      }
      const response = await api.post(`cart/${currentCartId}/add-item/`, {
        food_item_id: item.id,
        quantity: 1
      });
      dispatch(setCartData(response.data));
    } catch (err) {
      console.error('Error adding item to cart:', err);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* 1. Header & Title */}
      <div className="bg-espresso text-ivory py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=60" alt="Cafe menu header" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <span className="text-caramel text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Curated Artisanal Flavors
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-wide">THE CAFE MENU</h1>
          <div className="w-16 h-1 bg-caramel mx-auto"></div>
        </div>
      </div>

      {/* 2. QR Code Table detected banner */}
      {tableAlert && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-forest text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-2 text-sm font-semibold">
              <Check className="h-5 w-5 bg-white/20 p-0.5 rounded-full" />
              <span>{tableAlert} Your orders will be served directly to your table.</span>
            </div>
            <button onClick={() => setTableAlert(null)} className="text-white hover:text-ivory text-xs font-bold uppercase tracking-wider">Dismiss</button>
          </div>
        </div>
      )}

      {/* 3. Main Browser Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) / Toggle Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search bar */}
          <div className="relative bg-white rounded-xl shadow-premium border border-coffee/5 p-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-5 w-5 text-coffee/40" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-ivory/30 border-0 rounded-lg text-sm text-espresso placeholder-coffee/40 focus:ring-1 focus:ring-caramel focus:outline-none font-body"
              />
            </div>
          </div>

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-premium border border-coffee/5 p-6 space-y-6">
            <h3 className="font-heading text-lg font-bold text-espresso flex items-center space-x-2 pb-3 border-b border-coffee/5">
              <SlidersHorizontal className="h-5 w-5 text-caramel" />
              <span>Filters</span>
            </h3>

            {/* Veg/Non-Veg Filter */}
            <div className="space-y-3">
              <h4 className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Dietary Preferences</h4>
              <div className="flex flex-col space-y-2 font-body text-sm">
                {[
                  { key: 'all', label: 'Show All' },
                  { key: 'veg', label: 'Vegetarian Only' },
                  { key: 'non-veg', label: 'Non-Vegetarian Only' }
                ].map((pref) => (
                  <button
                    key={pref.key}
                    onClick={() => setVegFilter(pref.key)}
                    className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-left transition-all duration-200 ${
                      vegFilter === pref.key
                        ? 'bg-caramel/10 text-caramel font-semibold border-l-4 border-caramel'
                        : 'text-espresso hover:bg-ivory/50'
                    }`}
                  >
                    <span>{pref.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-3">
              <h4 className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 bg-ivory/30 border border-coffee/10 rounded-xl text-sm font-body text-espresso focus:outline-none focus:border-caramel"
              >
                <option value="default">Relevance / Alphabetical</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Popularity / Best Selling</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Toggler */}
          <div className="block lg:hidden flex gap-4">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border border-coffee/10 py-3.5 rounded-xl text-sm font-body font-semibold text-espresso hover:bg-ivory/30 shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-caramel" />
              <span>Filter & Sort</span>
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          {showFiltersMobile && (
            <div className="block lg:hidden bg-white p-6 rounded-2xl border border-coffee/5 space-y-6">
              {/* Veg / Non veg */}
              <div className="space-y-2">
                <h4 className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Dietary</h4>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'veg', label: 'Veg' },
                    { key: 'non-veg', label: 'Non-Veg' }
                  ].map((pref) => (
                    <button
                      key={pref.key}
                      onClick={() => setVegFilter(pref.key)}
                      className={`flex-1 py-2 rounded-lg text-center font-body text-xs font-semibold ${
                        vegFilter === pref.key ? 'bg-coffee text-ivory' : 'bg-ivory/50 text-espresso border border-coffee/10'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort selector */}
              <div className="space-y-2">
                <h4 className="font-body text-xs font-bold uppercase tracking-wider text-coffee/60">Sort</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-ivory/30 border border-coffee/10 rounded-xl text-xs font-body text-espresso focus:outline-none focus:border-caramel"
                >
                  <option value="default">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Categories Tab & FoodItems List */}
        <div className="lg:col-span-3 space-y-8">
          {/* Categories Tab Selector (Horizontal scrollable) */}
          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-none snap-x">
            <button
              onClick={() => setActiveCategory('all')}
              className={`snap-start px-6 py-3.5 rounded-full font-body text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
                activeCategory === 'all'
                  ? 'bg-coffee border-coffee text-ivory shadow-lg shadow-coffee/20'
                  : 'bg-white border-coffee/5 text-coffee hover:bg-caramel/10'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`snap-start px-6 py-3.5 rounded-full font-body text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
                  activeCategory === cat.slug
                    ? 'bg-coffee border-coffee text-ivory shadow-lg shadow-coffee/20'
                    : 'bg-white border-coffee/5 text-coffee hover:bg-caramel/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Food Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-[400px] rounded-2xl bg-white border border-coffee/5 animate-pulse flex flex-col p-5 space-y-4">
                  <div className="h-52 bg-coffee/5 rounded-xl"></div>
                  <div className="h-6 bg-coffee/5 rounded w-3/4"></div>
                  <div className="h-4 bg-coffee/5 rounded w-1/2"></div>
                  <div className="h-10 bg-coffee/5 rounded-xl mt-auto"></div>
                </div>
              ))}
            </div>
          ) : foodItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-coffee/5 shadow-premium space-y-3">
              <Search className="h-12 w-12 text-coffee/20 mx-auto" />
              <h3 className="font-heading text-xl font-bold text-espresso">No matches found</h3>
              <p className="font-body text-xs text-coffee/50 max-w-sm mx-auto">
                We couldn't find any food items matching your current filters. Try searching for something else or clearing the filters!
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setVegFilter('all');
                  setActiveCategory('all');
                  setSortBy('default');
                }}
                className="mt-4 inline-flex items-center space-x-1 font-body text-xs font-semibold text-caramel hover:text-coffee transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {foodItems.map((item) => (
                <FoodCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPage;

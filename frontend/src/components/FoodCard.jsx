import React from 'react';
import { Clock, Plus, AlertCircle, Award } from 'lucide-react';

const FoodCard = ({ item, onAddToCart }) => {
  const {
    name,
    description,
    price,
    image,
    is_veg,
    prep_time,
    is_available,
    is_bestseller,
    average_rating
  } = item;

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-premium shadow-premium-hover border border-coffee/5 ${!is_available ? 'opacity-75' : ''}`}>
      {/* Bestseller Badge */}
      {is_bestseller && (
        <span className="absolute top-4 left-4 z-10 flex items-center space-x-1 bg-gold-gradient text-espresso text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-lg">
          <Award className="h-3.5 w-3.5" />
          <span>Bestseller</span>
        </span>
      )}

      {/* Veg/Non-Veg Badge */}
      <span className={`absolute top-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border ${is_veg ? 'border-forest' : 'border-red-600'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${is_veg ? 'bg-forest' : 'bg-red-600'}`}></span>
      </span>

      {/* Image Container */}
      <div className="relative h-52 overflow-hidden bg-coffee/10">
        <img
          src={image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          loading="lazy"
        />
        {!is_available && (
          <div className="absolute inset-0 bg-espresso/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-body text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5">
              <AlertCircle className="h-4 w-4" />
              <span>Out of Stock</span>
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-heading text-lg font-bold text-espresso line-clamp-1">
            {name}
          </h3>
          <span className="font-body text-base font-bold text-caramel">
            Rs. {parseFloat(price).toFixed(2)}
          </span>
        </div>

        <p className="font-body text-xs text-coffee/70 line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Rating and Prep Time */}
        <div className="flex justify-between items-center text-xs font-body text-coffee/60 pt-2 border-t border-coffee/5">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 font-bold">★</span>
            <span className="font-semibold text-espresso">{average_rating || '5.0'}</span>
            <span className="text-coffee/40">({item.reviews ? item.reviews.length : 0})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-caramel shrink-0" />
            <span>{prep_time} mins</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => is_available && onAddToCart(item)}
          disabled={!is_available}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-body text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
            is_available
              ? 'bg-coffee text-ivory hover:bg-caramel hover:text-espresso cursor-pointer active:scale-95'
              : 'bg-coffee/10 text-coffee/40 cursor-not-allowed'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add to Order</span>
        </button>
      </div>
    </div>
  );
};

export default FoodCard;

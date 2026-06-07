import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, Award, Star, Heart, MapPin, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import FoodCard from '../components/FoodCard';
import { useDispatch, useSelector } from 'react-redux';
import { setCartId, setCartData } from '../store';

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartId } = useSelector((state) => state.cart);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('food-items/?is_bestseller=true');
        // Get top 3 items for featured section
        setFeaturedItems(response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

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
        quantity: 1,
      });
      dispatch(setCartData(response.data));
      // Notify user / visual queue (could navigate to cart)
      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-espresso overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop&q=80" 
            alt="Cafe Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 mx-auto space-y-6">
          <div className="flex justify-center mb-2">
            <Coffee className="h-12 w-12 text-caramel animate-pulse" />
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Artisanal Roasts & <br />
            <span className="text-gold-gradient">Gourmet Cuisine</span>
          </h1>
          <p className="font-body text-base md:text-xl text-ivory/80 max-w-2xl mx-auto leading-relaxed">
            Welcome to L'Ambroisie, where premium local ingredients meet world-class brewing craft. Dine in elegance, or scan your table QR code to order instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link 
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-gold-gradient text-espresso font-body text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>ORDER NOW</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-body text-sm font-semibold tracking-wider uppercase rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              VIEW MENU
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Dishes */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-caramel text-xs font-bold tracking-widest uppercase">Signature Selection</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso">FEATURED DISHES</h2>
          <div className="w-16 h-1 bg-caramel mx-auto"></div>
          <p className="font-body text-sm text-coffee/60">
            A hand-picked selection of our chefs' finest recipes, made fresh daily with seasonal local imports.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-coffee/5 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <FoodCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Why Choose Us */}
      <section className="py-20 bg-coffee text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-caramel text-xs font-bold tracking-widest uppercase">The L'Ambroisie Way</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">WHY CHOOSE US</h2>
            <div className="w-16 h-1 bg-caramel mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="space-y-4 p-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-caramel/10 border border-caramel/20 text-caramel">
                <Coffee className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold tracking-wide">In-House Roasted Beans</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed">
                We select premium single-origin Arabica beans, roasted in small batches on-site to lock in complex aromas.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="space-y-4 p-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-caramel/10 border border-caramel/20 text-caramel">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold tracking-wide">Award-Winning Chefs</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed">
                Our culinary experts create recipes fusing local culinary heritage with high-end culinary arts.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="space-y-4 p-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-caramel/10 border border-caramel/20 text-caramel">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold tracking-wide">Premium Atmosphere</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed">
                Designed to wow, our dining space offers quiet cozy corners, jazz records, and soft premium lighting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Photo Gallery */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-caramel text-xs font-bold tracking-widest uppercase">Visual Feast</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso">OUR GALLERY</h2>
          <div className="w-16 h-1 bg-caramel mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-64 rounded-2xl overflow-hidden shadow-premium">
            <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&auto=format&fit=crop&q=70" alt="Cafe view" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="h-64 rounded-2xl overflow-hidden shadow-premium">
            <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=70" alt="Latte art" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="h-64 rounded-2xl overflow-hidden shadow-premium">
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=70" alt="Fresh baked bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="h-64 rounded-2xl overflow-hidden shadow-premium">
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=70" alt="Pizza gourmet" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews */}
      <section className="py-20 bg-ivory border-t border-b border-coffee/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-caramel text-xs font-bold tracking-widest uppercase">Gourmet Stories</span>
          <h2 className="font-heading text-3xl font-bold text-espresso mt-2 mb-12">CUSTOMER REVIEWS</h2>
          
          <div className="space-y-6">
            <div className="flex justify-center space-x-1 text-yellow-500">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-6 w-6 fill-current" />)}
            </div>
            <p className="font-heading text-lg md:text-2xl italic text-coffee leading-relaxed">
              "L'Ambroisie Cafe is a gem! The Espresso Gold is the best I've tasted outside of Milan, and their Margherita pizza has that perfect sourdough wood-fired crust. Ordering from table via QR code is incredibly smooth."
            </p>
            <div className="font-body text-sm">
              <span className="font-bold text-espresso block">Dr. Sarah Connor</span>
              <span className="text-coffee/50">Food Critic & Regular Diner</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact & Google Map */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-caramel text-xs font-bold tracking-widest uppercase">Locate Us</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso">VISIT THE CAFE</h2>
          <div className="w-16 h-1 bg-caramel"></div>
          <p className="font-body text-sm text-coffee/60 leading-relaxed">
            Nestled in the heart of the capital, L'Ambroisie offers a peaceful getaway with rich espresso, delicious foods, and quiet working lounge spaces.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-caramel shrink-0 mt-0.5" />
              <div>
                <h4 className="font-body font-bold text-sm text-espresso">Address</h4>
                <p className="font-body text-xs text-coffee/70 mt-1">
                  12, Gourmet Boulevard, Connaught Place, New Delhi - 110001
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="h-5 w-5 text-caramel shrink-0 mt-0.5" />
              <div>
                <h4 className="font-body font-bold text-sm text-espresso">Phone</h4>
                <p className="font-body text-xs text-coffee/70 mt-1">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="h-5 w-5 text-caramel shrink-0 mt-0.5" />
              <div>
                <h4 className="font-body font-bold text-sm text-espresso">Email</h4>
                <p className="font-body text-xs text-coffee/70 mt-1">info@lambroisie.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Map Visualizer */}
        <div className="h-96 rounded-2xl overflow-hidden border border-coffee/15 shadow-premium bg-coffee/5 relative">
          <iframe
            title="Cafe Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1352936270546!2d77.2182283150824!3d28.625686082420456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd36a30c0001%3A0xe5a3c9be06a6c429!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1623543200000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

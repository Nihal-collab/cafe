import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, Eye, EyeOff, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('reviews/');
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (review) => {
    try {
      await api.post(`reviews/${review.id}/toggle-approval/`);
      loadReviews();
    } catch (err) {
      console.error('Failed to toggle review approval:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Customer Reviews</h1>
          <p className="font-body text-xs text-coffee/50 uppercase tracking-widest mt-1">Audit customer reviews and feedback</p>
        </div>
        <button
          onClick={loadReviews}
          className="inline-flex items-center space-x-1 border border-coffee/10 px-4 py-2 bg-white rounded-xl text-xs font-body font-bold uppercase tracking-wider text-espresso hover:bg-ivory/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-coffee/5 animate-pulse rounded-2xl"></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-coffee/5 p-16 text-center space-y-2 max-w-lg mx-auto shadow-premium">
          <MessageSquare className="h-10 w-10 text-coffee/20 mx-auto" />
          <h4 className="font-heading text-lg font-bold text-espresso">No Reviews Yet</h4>
          <p className="font-body text-xs text-coffee/50">Customer reviews will populate here once orders are completed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className={`bg-white rounded-2xl border border-coffee/5 p-5 shadow-premium flex flex-col justify-between space-y-4 relative ${
                !rev.is_approved ? 'opacity-60 bg-coffee/[0.01]' : ''
              }`}
            >
              {/* Review Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading text-sm font-bold text-espresso">{rev.customer_name}</h4>
                  <span className="font-body text-[10px] text-coffee/40">
                    Reviewed: <strong className="text-caramel font-semibold">{rev.food_item_name}</strong> | {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Rating Stars */}
                <div className="flex space-x-0.5 text-yellow-500 shrink-0">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`h-4.5 w-4.5 ${idx < rev.rating ? 'fill-current' : 'text-coffee/20'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p className="font-body text-xs text-coffee/70 italic leading-relaxed">
                "{rev.comment || 'No comment provided.'}"
              </p>

              {/* Actions */}
              <div className="pt-3 border-t border-coffee/5 flex justify-between items-center text-[10px] font-body">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  rev.is_approved ? 'bg-forest/10 text-forest' : 'bg-red-100 text-red-700'
                }`}>
                  {rev.is_approved ? 'Visible on Menu' : 'Hidden / Rejected'}
                </span>
                <button
                  onClick={() => handleToggleApproval(rev)}
                  className={`inline-flex items-center space-x-1 font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg border ${
                    rev.is_approved 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-forest/10 border-forest/20 text-forest hover:bg-forest hover:text-white'
                  } transition-all duration-200`}
                >
                  {rev.is_approved ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide Review</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;

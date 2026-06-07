import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Shield, Key, User, Coffee, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { setCredentials } from '../store';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to simplejwt auth endpoint
      const response = await api.post('auth/login/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Save token in redux
      dispatch(setCredentials({
        token: access,
        user: { username }
      }));

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10 z-0">
        <img 
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&auto=format&fit=crop&q=60" 
          alt="background pattern" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-md w-full bg-espresso/80 border border-caramel/20 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-caramel/10 border border-caramel/20 text-caramel">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white tracking-wide">ADMIN PORTAL</h2>
          <p className="font-body text-[11px] text-ivory/50 uppercase tracking-widest">L'Ambroisie Cafe Management</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-body text-xs text-ivory/80">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-caramel/80 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="E.g. admin"
              className="w-full p-3 bg-espresso/50 border border-caramel/25 rounded-xl text-sm text-white placeholder-ivory/20 focus:outline-none focus:border-caramel"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-caramel/80 flex items-center space-x-1.5">
              <Key className="h-3.5 w-3.5" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-espresso/50 border border-caramel/25 rounded-xl text-sm text-white placeholder-ivory/20 focus:outline-none focus:border-caramel"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold-gradient text-espresso font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center disabled:opacity-50"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/menu"
            className="font-body text-[10px] text-ivory/40 hover:text-caramel transition-colors uppercase tracking-wider flex items-center justify-center space-x-1"
          >
            <Coffee className="h-3.5 w-3.5" />
            <span>Return to Customer Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

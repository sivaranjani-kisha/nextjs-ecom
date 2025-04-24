"use client";
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export const AuthModal = ({ onClose, onSuccess, error }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { updateCartCount } = useCart();
  const { updateWishlist } = useWishlist();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      const endpoint = activeTab === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeTab === 'login' ? {
          email: formData.email,
          password: formData.password
        } : {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Fetch both cart and wishlist counts after login
        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch('/api/cart/count', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          }),
          fetch('/api/wishlist', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          })
        ]);

        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          updateCartCount(cartData.count);
        }

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          updateWishlist(wishlistData.items, wishlistData.count);
        }
      }
      
      onSuccess();
    } catch (error) {
      console.error('Authentication error:', error);
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 max-w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-2 px-1 ${
              activeTab === 'login' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {activeTab === 'register' && (
            <input
              type="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {(formError || error) && (
            <div className="text-red-500 text-sm">
              {formError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200"
          >
            {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};
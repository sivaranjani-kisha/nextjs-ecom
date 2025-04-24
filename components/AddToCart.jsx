"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import {AuthModal} from '@/components/AuthModal';
const AddToCartButton = ({ productId, quantity = 1 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cartSuccess, setCartSuccess] = useState(false);
  const { cartCount, updateCartCount } = useCart();
  const handleAddToCart = async () => {
    setIsLoading(true);
    setAuthError('');
    setCartSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
    
      // Check authentication
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      const data = await response.json();
      
      if (!data.loggedIn) {
        setShowAuthModal(true);
        return;
      }

      // Add to cart API call
      const cartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to add to cart');
      }
      const responseData = await cartResponse.json();
      updateCartCount(responseData.cart.totalItems);

      setCartSuccess(true);
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Add to cart error:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`px-4 py-2 rounded hover:opacity-90 transition-colors duration-200 ${
          isLoading ? 'bg-gray-400' : 
          cartSuccess ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
        }`}
      >
        {isLoading ? 'Adding...' : 
         cartSuccess ? '✓ Added to Cart' : '🛒 Add to Cart'}
      </button>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            handleAddToCart();
          }}
          error={authError}
        />
      )}
    </>
  );
};

// Auth Modal Component


export default AddToCartButton;
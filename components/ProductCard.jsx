"use client";
import { useModal } from '@/context/ModalContext';
import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Ban } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

const AddToWishlistButton = ({ productId, isOutOfStock = false }) => {
  const { openAuthModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const { wishlistCount, wishlistItems, isInWishlist, updateWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(productId));

  useEffect(() => {
    setIsWishlisted(isInWishlist(productId));
  }, [productId, wishlistItems, isInWishlist]);

  const handleWishlistAction = async () => {
    // Prevent action if product is out of stock
    if (isOutOfStock) {
      return;
    }

    setIsLoading(true);
    setAuthError('');
    
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
        openAuthModal(() => {
          handleWishlistAction(); // Retry after login
        }, 'You must be logged in to add to wishlist.');
        return;
      }

      // Determine if we're adding or removing
      const isCurrentlyWishlisted = isInWishlist(productId);
      const method = isCurrentlyWishlisted ? 'DELETE' : 'POST';

      // API call
      const wishlistResponse = await fetch('/api/wishlist', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId }),
      });

      if (!wishlistResponse.ok) {
        throw new Error(`Failed to ${isCurrentlyWishlisted ? 'remove from' : 'add to'} wishlist`);
      }
      
      const responseData = await wishlistResponse.json();
      updateWishlist(responseData.items, responseData.count);
      
    } catch (error) {
      // console.error('Wishlist error:', error);
      setAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // If product is out of stock, show disabled state
 if (isOutOfStock) {
    return null;
  }


  return (
    <>
      <button 
        className={`p-1 rounded-full bg-white shadow ${
          isWishlisted ? 'text-red-500' : 'hover:text-red-500'
        } ${isLoading ? 'opacity-50' : ''}`} 
        onClick={handleWishlistAction} 
        disabled={isLoading || isOutOfStock}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
    </>
  );
};

export default AddToWishlistButton;
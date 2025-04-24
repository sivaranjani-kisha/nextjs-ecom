"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setWishlistItems(data.items || []);
          setWishlistCount(data.count || 0);
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        }
      }
    };
    fetchWishlist();
  }, []);

  const isInWishlist = (productId) => {
    console.log(wishlistItems);
    return wishlistItems.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    setWishlistCount(0);
  };

  const updateWishlist = (items, count) => {
    setWishlistItems(items);
    setWishlistCount(count);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistCount, 
      wishlistItems,
      isInWishlist,
      updateWishlist,
      clearWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};
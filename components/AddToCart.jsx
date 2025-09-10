"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import { useHeaderdetails } from '@/context/HeaderContext';
import { trackAddToCart } from "@/utils/nextjs-event-tracking.js";

import { FaShoppingCart} from "react-icons/fa";

const AddToCartButton = ({ productId, quantity = 1, warranty, additionalProducts = [],extendedWarranty, selectedFrequentProducts = [], stockQuantity = 1,special_price }) => {
  const { openAuthModal } = useModal();
  const { updateHeaderdetails, setIsLoggedIn, setUserData,setIsAdmin } = useHeaderdetails();
  const [isLoading, setIsLoading] = useState(false);
  // const [showAuthModal, setShowAuthModal] = useState(false);
  // const [authError, setAuthError] = useState('');
  const [cartSuccess, setCartSuccess] = useState(false);
  const isOutOfStock = stockQuantity <= 0;
    const isprice = special_price <= 0;
  const { cartCount, updateCartCount } = useCart();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const handleAddToCart = async () => {
     if (isOutOfStock) return;

     if(isprice){
      return;
     }
      setIsLoading(true);
      // setAuthError('');
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
          openAuthModal({
            error: 'Please log in to continue.',
            onSuccess: () => handleAddToCart(), // retry on success
          });
          return;
        }

      
        if (data.loggedIn) {
          updateHeaderdetails({ user: data.user });
            setIsLoggedIn(true);
            const role = data.role;
          if(role == 'admin'){
            setIsAdmin(true);
          }
        }

        const proresponse = await fetch(`/api/product/get/${productId}`);
       
        if (!proresponse.ok) {
          throw new Error(`HTTP error! status: ${proresponse.status}`);
        }
        
        const productData = await proresponse.json();

  
        // Add main product to cart
        const cartResponse = await fetch('/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity, 
          selectedWarranty: warranty,
          selectedExtendedWarranty: extendedWarranty,}),
        });
  
        if (!cartResponse.ok) {
          throw new Error('Failed to add to cart');
        }
  
        // Add additional products if any
        if (additionalProducts.length > 0) {
          await Promise.all(
            additionalProducts.map(async (additionalId) => {
              const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: additionalId, quantity: 1 }),
              });
              if (!res.ok) throw new Error('Failed to add additional product');
            })
          );
        }
  
        const responseData = await cartResponse.json();
        updateCartCount(responseData.cart.totalItems + additionalProducts.length);

        // Event Tracking
      trackAddToCart({
        user: {
          name: data.user.name,
          phone: data.phone,
          email: data.user.email,
        },
        product: {
          id: productId,
          name: responseData.cart.items[0].name,
          price: responseData.cart.items[0].price,
          link: `${apiUrl}/product/${productData.data.slug}`,
          image: `${apiUrl}/uploads/products/`+responseData.cart.items[0].image,
          qty: responseData.cart.items[0].quantity,
          currency: "INR",
        },
      });

        // ✅ Store selected product IDs for persistence
if (selectedFrequentProducts?.length > 0) {
  const ids = selectedFrequentProducts.map(p => p._id);
  localStorage.setItem("selectedFrequentProductIds", JSON.stringify(ids));
} else {
  localStorage.removeItem("selectedFrequentProductIds");
}
  
        setCartSuccess(true);
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
  disabled={isLoading || isOutOfStock || isprice}
  className={`w-full sm:w-auto px-2 py-2 md:px-3 md:py-2 rounded-md shadow-md  transition duration-300 text-sm flex items-center justify-center gap-x-1 
    ${isOutOfStock
          ? 'bg-gray-400 cursor-not-allowed text-white'
          :
      isLoading 
        ? 'bg-blue-700 cursor-not-allowed opacity-75' 
        : cartSuccess 
          ? 'bg-green-500 text-white hover:bg-green-600'
          // : isprice
          // ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-customBlue text-white hover:bg-blue-700'
    }
    active:scale-95 disabled:active:scale-100`}
>
  {isOutOfStock ? (
        <span>Out of Stock</span>
      ) : isLoading ? (
    <>
      <svg 
        className="animate-spin h-5 w-5" 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="hidden sm:inline">Adding...</span>
    </>
  ) : cartSuccess ? (
    <>
      <FaShoppingCart />
      <span className="hidden sm:inline">Added to Cart</span>
      <span className="sm:hidden">Added</span>
    </>
  ) : (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      <span className="hidden sm:inline" >Add to Cart</span>
      <span className="sm:hidden">Add</span>
    </>
  )}
</button>
{/* 
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            handleAddToCart();
          }}
          error={authError}
        />
      )} */}
    </>
  );
};

// Auth Modal Component


export default AddToCartButton;
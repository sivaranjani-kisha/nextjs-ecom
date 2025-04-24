"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import Addtocart from "@/components/AddToCart";
import Link from "next/link";
// Custom Confirm Modal
const ConfirmModal = ({ show, onClose, onConfirm }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Remove item?</h3>
          <p className="text-gray-500 mb-4">Are you sure you want to delete this item from your wishlist?</p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={onConfirm}
            >
              Yes, Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Custom Success Modal
const SuccessModal = ({ show, message, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-green-600 mb-2">Success!</h3>
          <p className="text-gray-500 mb-4">{message}</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={onClose}
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/wishlist/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const confirmRemove = (productId) => {
    setItemToDelete(productId);
    setShowConfirmModal(true);
  };

  const handleRemove = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/wishlist/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: itemToDelete }),
      });

      const data = await res.json();

      if (res.ok) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.productId !== itemToDelete)
        );
        setShowConfirmModal(false);
        setItemToDelete(null);
        setShowSuccessModal(true);
      } else {
        alert(data.message || "Failed to remove item.");
      }
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleRemove}
      />

      <SuccessModal
        show={showSuccessModal}
        message="Item removed from wishlist!"
        onClose={() => setShowSuccessModal(false)}
      />

      <div className="bg-blue-50 py-6 px-8 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Wishlist</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">🏠 Home</span>
          <span className="text-gray-500">›</span>
          <span className="text-orange-500 font-semibold">Wishlist</span>
        </div>
      </div>

      <div className="max-w-9xl mx-auto flex flex-col gap-6 p-6">
        {loading ? (
          <div className="text-center text-gray-500">Loading wishlist...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center text-gray-600">Your wishlist is empty.</div>
        ) : (
          <div className="rounded-lg border overflow-x-auto mb-10">
            <table className="w-full min-w-max mt-4 border-collapse">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="py-3 px-6 text-center font-semibold">Delete</th>
                  <th className="py-3 px-6 font-semibold">Product Name</th>
                  <th className="py-3 px-6 text-center font-semibold">Unit Price</th>
                  <th className="py-3 px-6 text-center font-semibold">Stock Status</th>
                  <th className="py-3 px-6 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <td className="py-4 px-6 text-center">
                      <button
                        className="text-black hover:text-red-700 flex items-center gap-1"
                        onClick={() => confirmRemove(item.productId)}
                      >
                        <CiCircleRemove /> Remove
                      </button>
                    </td>
                    <td className="flex items-center py-4 px-6 space-x-4">
                      <Image
                        src={`/uploads/products/${item.image}`}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                      <div className="ml-4">
                         <Link href={`/product/${item.slug}`}>
                      <p className="font-semibold hover:text-orange-500 cursor-pointer">
                      {item.name.length > 50 ? `${item.name.substring(0, 50)}...` : item.name}
                      </p>
                      </Link>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="text-yellow-500">⭐ {item.rating}</span>
                          <span className="ml-2">| {item.reviews} Reviews</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold">
                      {item.stockStatus}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-orange-500 text-white px-3 py-1 rounded flex items-center space-x-2"
                      >
                        <span>Add To Cart</span>
                        <FaShoppingCart />
                      </motion.button> */}
                       <Addtocart productId={item.productId} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

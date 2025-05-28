"use client";

import React, { useState, useEffect } from "react";
import { MdCancel, MdLocalShipping } from "react-icons/md";


export default function PendingOrders() {
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  
  const itemsPerPage = 5;
  
  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination variables
  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/get?status=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const handleOrderUpdate = async (orderId, status, reason = "") => {
    try {
      const token = localStorage.getItem("token");
    const response = await fetch(`/api/orders/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder,
          order_status: modalType === "cancel" ? "cancelled" : "shipped",
          cancellation_reason: modalType === "cancel" ? cancellationReason : "",
        }),
      });

      const data = await response.json();
      if (data.success) {
         setShowModal(false);
        setAlertMessage(`Order status updated to ${status}`);
        setCancellationReason("");
        fetchOrders();
        setTimeout(() => setAlertMessage(null), 3000); // Refresh orders
        // setShowModal(false);
      } else {
        setError(data.error || "Failed to update order status");
      }
    } catch (error) {
      setError("An error occurred while updating the order");
      console.error("Error updating order:", error);
    }
  };

  const handleDownloadInvoice = (orderNumber) => {
    // Implement invoice download logic
    console.log("Download invoice for order:", orderNumber);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Alert Message */}
      {alertMessage && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {alertMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Pending Order List</h2>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          {/* Search */}
          <div className="flex justify-between items-center bg-white mb-3">
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2.5a7.5 7.5 0 010 15z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <hr className="border-t border-gray-200 mb-4" />

          {/* Orders Table */}
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Order ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Mobile</th>
                <th className="p-2">Price</th>
                <th className="p-2">Order Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="text-center border">
                    <td className="px-4 py-2">{order.order_number}</td>
                    <td className="px-4 py-2">{order.email_address}</td>
                    <td className="px-4 py-2">{order.order_phonenumber}</td>
                    <td className="px-4 py-2">{order.order_amount}</td>
                    <td className="px-4 py-2">{order.order_status}</td>
                    <td className="px-4 py-2 flex space-x-2 justify-center">
                      <button
                        className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full inline-flex items-center justify-center"
                        onClick={() => {
                          setSelectedOrder(order._id);
                          setModalType("cancel");
                          setShowModal(true);
                        }}
                      >
                        <MdCancel className="w-5 h-5" />
                      </button>
                      <button
                        className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full inline-flex items-center justify-center"
                        onClick={() => {
                          setSelectedOrder(order._id);
                          setModalType("ship");
                          setShowModal(true);
                        }}
                      >
                       <MdLocalShipping className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} entries
            </div>

            <div className="pagination flex items-center space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                «
              </button>

              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "text-black bg-white hover:bg-gray-100"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount}
                className={`px-3 py-1.5 border border-gray-300 rounded-md ${
                  currentPage === pageCount
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Action Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {modalType === "cancel" ? "Cancel Order" : "Ship Order"}
            </h2>
            
            {modalType === "cancel" && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows="3"
                  placeholder="Enter reason for cancellation"
                />
              </div>
            )}
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setCancellationReason("");
                }}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOrderUpdate(
                  selectedOrder, 
                  modalType === "cancel" ? "cancelled" : "shipped",
                  cancellationReason
                )}
                className={`px-4 py-2 rounded-md text-white ${
                  modalType === "cancel" ? "bg-red-500" : "bg-green-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirmation</h2>
            <p className="mb-4">{confirmationMessage}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
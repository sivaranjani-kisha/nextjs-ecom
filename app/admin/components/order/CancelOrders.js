"use client";

import React, { useState, useEffect } from "react";
import { MdCancel } from "react-icons/md";

export default function CancelledOrders() {
  const [activeTab, setActiveTab] = useState("cancelled");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState(null);
  const itemsPerPage = 5;

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
        setAlertMessage("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAlertMessage("Error fetching orders");
    }
    setLoading(false);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
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



  return (
    <div className="container mx-auto p-4">
      {/* Alert Message */}
      {alertMessage && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
          {alertMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Cancelled Order List</h2>
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
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="text-center border">
                    <td className=" px-4 py-2">{order.order_number || 'N/A'}</td>
                    <td className=" px-4 py-2">{order.email_address || 'N/A'}</td>
                    <td className=" px-4 py-2">{order.order_phonenumber || 'N/A'}</td>
                    <td className=" px-4 py-2">{order.order_amount || 'N/A'}</td>
                   <td className="px-4 py-2">
                    <span className="bg-red-100 text-red-600 rounded-full font-medium text-sm px-3 py-1 inline-block capitalize">
                        {order.order_status || 'N/A'}
                    </span>
                    </td>

                   <td className="px-4 py-2 text-center">
                    <button
                        className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full inline-flex items-center justify-center"
                        title="Cancel"
                    >
                        <MdCancel className="w-5 h-5" />
                    </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No cancelled orders founding
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pageCount > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
}